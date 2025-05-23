document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("student_id");
  const clubId = params.get("clubId");

  console.log("✅ URL 參數", { studentId, clubId });

  if (!studentId || !clubId) {
    alert("缺少參數 clubId 或 student_id");
    return;
  }

  let canEdit = false;

  try {
    // 🔹 取得目前使用者的角色
    const userRes = await fetch(`/api/role-management/${clubId}/${studentId}`);
    if (!userRes.ok) throw new Error("無法取得使用者權限");
    const user = await userRes.json();
    console.log("使用者角色", user);
    canEdit = [1, 2].includes(user.role_id);

    document.getElementById("permission-title").textContent = `${clubId} 權限總覽`;

    // 🔹 取得社團所有成員權限
    const allRes = await fetch(`/api/role-management/${clubId}/members`);
    if (!allRes.ok) {
      const errorText = await allRes.text();
      console.error("取得成員權限失敗：", errorText);
      throw new Error("無法取得成員權限資料");
    }

    const members = await allRes.json();
    console.log("📋 成員權限資料", members);

    const tbody = document.getElementById("permission-info");
    tbody.innerHTML = "";

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-gray-500 p-4">尚無成員資料</td></tr>`;
      return;
    }

    // 建立表格
    for (const mem of members) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${mem.student_id}</td>
        <td class="border p-2">${mem.name}</td>
        <td class="border p-2">${mem.role_name}</td>
        <td class="border p-2">
          <input type="checkbox" data-role="${mem.role_id}" data-type="can_manage_member" ${mem.can_manage_member ? 'checked' : ''} ${canEdit ? '' : 'disabled'}>
        </td>
        <td class="border p-2">
          <input type="checkbox" data-role="${mem.role_id}" data-type="can_manage_asset" ${mem.can_manage_asset ? 'checked' : ''} ${canEdit ? '' : 'disabled'}>
        </td>
        <td class="border p-2">
          <input type="checkbox" data-role="${mem.role_id}" data-type="can_manage_finance" ${mem.can_manage_finance ? 'checked' : ''} ${canEdit ? '' : 'disabled'}>
        </td>
        <td class="border p-2">
          <input type="checkbox" data-role="${mem.role_id}" data-type="can_manage_permission" ${mem.can_manage_permission ? 'checked' : ''} ${canEdit ? '' : 'disabled'}>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // 綁定儲存按鈕
    document.getElementById("permission-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!canEdit) return;

      const changed = {};
      const checkboxes = document.querySelectorAll("input[type=checkbox][data-role]");
      checkboxes.forEach(cb => {
        const roleId = cb.dataset.role;
        const type = cb.dataset.type;
        if (!changed[roleId]) changed[roleId] = {};
        changed[roleId][type] = cb.checked;
      });

      for (const [roleId, values] of Object.entries(changed)) {
        const res = await fetch(`/api/role-management/${clubId}/${roleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });
        const result = await res.json();
        if (!res.ok) {
          alert(`更新 role_id=${roleId} 時失敗：${result.error}`);
        }
      }

      alert("所有權限更新成功！");
    });

    if (!canEdit) {
      document.querySelector("#permission-form button[type=submit]").style.display = "none";
    }

  } catch (err) {
    console.error("⚠️ 發生錯誤：", err);
    alert("發生錯誤，請稍後再試");
  }
});
