document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const clubId = params.get("clubId");
  if (!clubId) return alert("缺少 clubId");

  const studentId = localStorage.getItem("studentId");
  if (!studentId) return alert("請先登入");

  let role = "";
  const allowedRoles = ["社長", "副社長", "總務"];

  // 先檢查角色
  try {
    const res = await fetch(`/api/member/role-permission/${clubId}/${studentId}`);
    const data = await res.json();
    role = data.role_name;
    console.log("目前使用者角色為：", role);

    // 顯示新增與刪除按鈕（僅限社長、副社長、總務）
    if (allowedRoles.includes(role)) {
      const section = document.getElementById("add-member-section");
      section.classList.remove("hidden");

      document.getElementById("addMemberBtn").addEventListener("click", () => {
        window.location.href = `member-add.html?clubId=${clubId}`;
      });

      document.getElementById("deleteMemberBtn").addEventListener("click", () => {
        window.location.href = `member-delete.html?clubId=${clubId}`;
      });
    }
  } catch (err) {
    console.error("權限檢查錯誤：", err);
    alert("無法檢查權限，請稍後再試");
    return;
  }

  // 讀取會員列表
  try {
    const res = await fetch(`/api/member/list/${clubId}`);
    const data = await res.json();
    const tbody = document.getElementById("member-table");

    data.forEach(m => {
      const studentLink = allowedRoles.includes(role)
        ? `<a href="member-detail.html?student_id=${m.student_id}&clubId=${clubId}" class="text-blue-600 hover:underline">${m.student_id}</a>`
        : `<span>${m.student_id}</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${studentLink}</td>
        <td class="border p-2">${m.name}</td>
        <td class="border p-2">${m.department}</td>
        <td class="border p-2">${m.grade}</td>
        <td class="border p-2">${m.role_name}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("讀取會員總覽錯誤：", err);
    alert("無法讀取會員列表");
  }
});
