document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("student_id");
  const clubId = params.get("clubId");

  if (!studentId || !clubId) return alert("缺少參數 clubId 或 student_id");

  try {
    const res = await fetch(`/api/member/role-permission/${clubId}/${studentId}`);
    const data = await res.json();

    document.getElementById("permission-title").textContent = `${studentId} 的權限管理`;

    const tbody = document.getElementById("permission-info");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${data.student_id}</td>
      <td class="border jip-2">${data.name}</td>
      <td class="border p-2">${data.role_name}</td>
      <td class="border p-2">${data.can_manage_member ? '可' : '否'}</td>
      <td class="border p-2">${data.can_manage_asset ? '可' : '否'}</td>
      <td class="border p-2">${data.can_manage_finance ? '可' : '否'}</td>
      <td class="border p-2">${data.can_manage_permission ? '可' : '否'}</td>
    `;
    tbody.appendChild(tr);
  } catch (err) {
    console.error("角色與權限載入錯誤：", err);
  }
});
