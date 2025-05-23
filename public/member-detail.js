document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("student_id");
  if (!studentId) return alert("缺少 student_id");

  try {
    const res = await fetch(`/api/member/detail/${studentId}`);
    const data = await res.json();
    const detailDiv = document.getElementById("detail");
    detailDiv.innerHTML = `
      <p><strong>姓名：</strong>${data.name}</p>
      <p><strong>系所：</strong>${data.department}</p>
      <p><strong>年級：</strong>${data.grade}</p>
      <p><strong>電話：</strong>${data.phone}</p>
      <p><strong>Email：</strong>${data.email}</p>
      <p><strong>緊急聯絡人：</strong>${data.emergency_contact_name} (${data.emergency_contact_phone})</p>
      <p><strong>飲食：</strong>${data.diet}</p>
    `;
  } catch (err) {
    console.error("載入會員詳細資料錯誤：", err);
  }
});