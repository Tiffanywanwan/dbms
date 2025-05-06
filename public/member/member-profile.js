document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("student_id");
  if (!studentId) return alert("缺少 student_id");

  try {
    const res = await fetch(`/api/member/profile/${studentId}`);
    const data = await res.json();

    const profileDiv = document.getElementById("profile");
    profileDiv.innerHTML = `
    <p><strong>學號：</strong>${data.member.student_id}</p>
    <p><strong>姓名：</strong>${data.member.name}</p>
    <p><strong>系所：</strong>${data.member.department}</p>
    <p><strong>年級：</strong>${data.member.grade}</p>
    <p><strong>電話：</strong>${data.member.phone}</p>
    <p><strong>Email：</strong>${data.member.email}</p>
    <p><strong>緊急聯絡人：</strong>${data.member.emergency_contact_name}（${data.member.emergency_contact_phone}）</p>
    <p><strong>飲食習慣：</strong>${data.member.diet}</p>
    <p><strong>入會日期：</strong>${data.member.join_date}</p>
    `;

    const historyUl = document.getElementById("club-history");
    data.clubs.forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.join_semester} 加入 ${c.club_name}（${c.role_name}）`;
      historyUl.appendChild(li);
    });
  } catch (err) {
    console.error("載入會員資料錯誤：", err);
  }
});