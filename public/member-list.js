document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const clubId = params.get("clubId");
  if (!clubId) return alert("缺少 clubId");

  const studentId = localStorage.getItem("studentId");
  if (!studentId) return alert("請先登入");

  try {
    const res = await fetch(`/api/member/list/${clubId}`);
    const data = await res.json();
    const tbody = document.getElementById("member-table");

    data.forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2 text-blue-600 hover:underline">
          <a href="member-detail.html?student_id=${m.student_id}">${m.student_id}</a>
        </td>
        <td class="border p-2">${m.name}</td>
        <td class="border p-2">${m.department}</td>
        <td class="border p-2">${m.grade}</td>
        <td class="border p-2">${m.role_name}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("讀取會員總覽錯誤：", err);
  }
  // 🔐 判斷是否為社長或副社長，顯示新增按鈕
  try {
    const res = await fetch(`/api/member/role-permission/${clubId}/${studentId}`);
    const data = await res.json();
    const role = data.role_name;

    if (role === "社長" || role === "副社長") {
      const section = document.getElementById("add-member-section");
      section.classList.remove("hidden");
      document.getElementById("addMemberBtn").addEventListener("click", () => {
        window.location.href = `member-add.html?clubId=${clubId}`;
      });
    }
  } catch (err) {
    console.error("權限檢查錯誤：", err);
  }
});
