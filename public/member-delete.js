document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("deleteMemberForm");
    const urlParams = new URLSearchParams(window.location.search);
    const clubId = urlParams.get("clubId");
    const operatorId = localStorage.getItem("studentId");
  
    if (!clubId || !operatorId) {
      alert("缺少必要資訊，請重新登入或指定社團");
      return;
    }
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const studentIdToDelete = document.getElementById("studentId").value.trim();
      console.log("抓到 studentId:", studentIdToDelete);
  
      if (!studentIdToDelete) return alert("請輸入要刪除的學號");
      if (!confirm(`是否確定刪除學號為 ${studentIdToDelete} 的會員？`)) return;
  
      try {
        const res = await fetch(`http://localhost:3001/members/${clubId}/${studentIdToDelete}`, {
          method: "DELETE"
        });
  
        console.log("刪除 API 回傳狀態:", res.status);
  
        if (res.ok) {
          alert("刪除成功！");
          window.location.href = `member-list.html?clubId=${clubId}`;
        } else {
          const result = await res.json();
          alert("刪除失敗：" + (result.message || "未知錯誤"));
        }
      } catch (err) {
        console.error("刪除會員錯誤：", err);
        alert("伺服器錯誤，請稍後再試");
      }
    });
  });
  