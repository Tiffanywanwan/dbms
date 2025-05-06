document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addMemberForm");
    const urlParams = new URLSearchParams(window.location.search);
    const clubId = urlParams.get("clubId");
    const operatorId = localStorage.getItem("studentId");
  
    if (!clubId || !operatorId) {
      alert("缺少必要資訊，請重新登入或指定社團");
      return;
    }
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      const studentId = formData.get("studentId");
      const defaultPassword = studentId;
  
      const body = {
        studentId,
        name: formData.get("name"),
        department: formData.get("department"),
        grade: formData.get("grade"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        password: defaultPassword,
        emergency_contact_name: formData.get("emergency_contact_name"),
        emergency_contact_phone: formData.get("emergency_contact_phone"),
        diet: formData.get("diet"),
        join_date: formData.get("join_date"),
        roleId: parseInt(formData.get("roleId")),
        clubId,
        operatorId
      };
  
      try {
        const res = await fetch("/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
  
        const result = await res.json();
        if (res.ok) {
          alert("新增成功！");
          window.location.href = `member-list.html?clubId=${clubId}`;
        } else {
          alert("新增失敗：" + result.message);
        }
      } catch (err) {
        console.error("新增會員錯誤：", err);
        alert("伺服器錯誤，請稍後再試");
      }
    });
  });
  