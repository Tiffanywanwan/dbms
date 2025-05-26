/* public/role-management.js  💾 直接整檔覆蓋 -------------------------------- */
document.addEventListener("DOMContentLoaded", async () => {

  /* ---------- 1. 解析參數：URL 沒帶就用 storage -------------------------- */
  const qs = new URLSearchParams(location.search);
  const clubId = qs.get("clubId") || sessionStorage.getItem("clubId");
  const studentId = qs.get("student_id") || localStorage.getItem("studentId");

  if (!clubId || !studentId) {
    alert("缺少 clubId 或 student_id，請重新由社團總覽進入");
    return;
  }
  sessionStorage.setItem("clubId", clubId);     // 方便其它頁

  /* 一個小包裝：每次 fetch 都自動帶 X-Student-Id / X-Club-Id header -------- */
  const apiFetch = (url, opt = {}) => {
    const headers = opt.headers ? { ...opt.headers } : {};
    headers["X-Student-Id"] = studentId;
    headers["X-Club-Id"] = clubId;
    return fetch(url, { ...opt, headers });
  };

  /* ---------- 2. 先確認自己是不是能編輯（社長 1 / 副社 2） --------------- */
  let canEdit = false;
  try {
    const uRes = await apiFetch(`/api/role-management/${clubId}/${studentId}`);
    if (!uRes.ok) throw await uRes.text();
    const me = await uRes.json();
    canEdit = [1, 2].includes(me.role_id);
    document.getElementById("permission-title").textContent =
      `${clubId} 權限總覽`;
  } catch (e) {
    console.error("讀取自己的角色失敗：", e);
    alert("權限讀取錯誤");
    return;
  }

  /* ---------- 3. 抓全員權限，畫表 --------------------------------------- */
  let members = [];
  try {
    const res = await apiFetch(`/api/role-management/${clubId}/members`);
    if (!res.ok) throw await res.text();
    members = await res.json();
    renderTable(members, canEdit);
  } catch (e) {
    console.error("載入成員權限失敗：", e);
    alert("載入資料失敗");
    return;
  }

  /* ---------- 4. 送出更新（只有 canEdit 才會綁） ------------------------ */
  if (canEdit) {
    document.getElementById("permission-form").addEventListener("submit", async e => {
      e.preventDefault();
      const updates = collectUpdates();
      try {
        await Promise.all(updates.map(u =>
          apiFetch(`/api/role-management/${clubId}/${u.role_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(u.values)
          })
        ));
        alert("已全部更新！");
      } catch (err) {
        console.error("更新失敗：", err);
        alert("有些權限更新失敗，請檢查主控台");
      }
    });
  } else {
    /* 沒編輯權就把「儲存」按鈕藏掉 */
    document.querySelector("#permission-form button[type=submit]").style.display = "none";
  }

  /* ======================================================================= */
  /* -------------------------   工具函式們   ------------------------------ */

  function renderTable(list, editable) {
    const tbody = document.getElementById("permission-info");
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-gray-500 p-4">尚無成員資料</td></tr>`;
      return;
    }
    tbody.innerHTML = "";
    list.forEach(m => {
      tbody.insertAdjacentHTML("beforeend", `
        <tr>
          <td class="border p-2">${m.student_id}</td>
          <td class="border p-2">${m.name}</td>
          <td class="border p-2">${m.role_name}</td>
          ${ck("can_manage_member")}
          ${ck("can_manage_asset")}
          ${ck("can_manage_finance")}
          ${ck("can_manage_permission")}
        </tr>`);
      function ck(field) {
        const checked = m[field] ? "checked" : "";
        const disabled = editable ? "" : "disabled";
        return `<td class="border p-2">
                  <input type="checkbox"
                         data-role="${m.role_id}"
                         data-field="${field}"
                         ${checked} ${disabled}>
                </td>`;
      }
    });
  }

  function collectUpdates() {
    const map = {}; // role_id -> { field: bool ... }
    document.querySelectorAll("input[data-role]").forEach(cb => {
      const rid = cb.dataset.role;
      const field = cb.dataset.field;
      if (!map[rid]) map[rid] = {};
      map[rid][field] = cb.checked;
    });
    return Object.entries(map).map(([role_id, values]) => ({ role_id, values }));
  }

});
