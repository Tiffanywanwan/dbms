document.addEventListener("DOMContentLoaded", async () => {
  const clubList = document.getElementById("clubList");
  const avatar = document.getElementById("avatar");
  const semesterSelect = document.getElementById("semester");

  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId");

  // 載入使用者所屬社團資料
  async function loadUserClubs() {
    try {
      // 發送 GET 請求，不加 Authorization header（因為後端沒驗證 token）
      const res = await fetch(`http://localhost:3001/api/members/${studentId}/clubs`);
      if (!res.ok) throw new Error("無法載入社團資料");

      const clubs = await res.json();
      renderClubs(semesterSelect.value, clubs);
    } catch (err) {
      console.error(err);
      alert("資料載入錯誤");
    }
  }

  // 渲染社團卡片
  function renderClubs(semester, allClubs) {
    clubList.innerHTML = "";
    const filteredClubs = allClubs; // 若要依學期篩選可加條件

    filteredClubs.forEach(club => {
      const card = document.createElement("div");
      card.className =
        "bg-white shadow-md rounded-lg p-4 border hover:border-blue-500 transition cursor-pointer flex items-center justify-between";

      card.innerHTML = `
        <div>
          <p class="text-md text-gray-600 font-medium">${club.club_id}</p>
          <h3 class="text-lg font-bold text-blue-700">${club.club_name}</h3>
        </div>
        <i class="bi bi-chevron-right text-xl text-blue-500"></i>
      `;

      card.addEventListener("click", () => {
        window.location.href = `club.html?clubId=${club.club_id}`;
      });

      clubList.appendChild(card);
    });
  }

  // 切換學期時重新載入社團
  semesterSelect.addEventListener("change", () => {
    loadUserClubs();
  });

  // 點擊頭像跳轉個人頁
  avatar.addEventListener("click", () => {
    window.location.href = "profile.html";
  });

  // 初始載入社團
  await loadUserClubs();
});

