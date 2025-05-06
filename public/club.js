document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get("clubId");
  const clubNameEl = document.getElementById("clubName");
  const clubDropdown = document.getElementById("clubDropdown");
  const clubDropdownList = document.getElementById("clubDropdownList");
  const clubNameBtn = document.getElementById("clubNameButton");

  const studentId = localStorage.getItem("studentId");
  let semester = localStorage.getItem("currentSemester");

  if (!clubId || !studentId) {
    clubNameEl.textContent = "參數錯誤";
    return;
  }

  // ✅ 沒有 semester 時自動抓一個
  if (!semester) {
    try {
      const res = await fetch(`/api/members/${studentId}/semesters`);
      const semesters = await res.json();
      if (semesters.length > 0) {
        semester = semesters[0];
        localStorage.setItem("currentSemester", semester);
      }
    } catch (err) {
      console.error("取得學期失敗：", err);
    }
  }

  // ✅ 顯示目前社團
  try {
    const res = await fetch(`/api/clubs/${clubId}`);
    const club = await res.json();
    clubNameEl.textContent = `${club.club_id} ${club.club_name}`;
  } catch (err) {
    clubNameEl.textContent = `查詢失敗`;
    console.error("社團資料查詢失敗：", err);
  }

  // ✅ 下拉社團選單
  try {
    const res = await fetch(`/api/members/${studentId}/clubs?semester=${semester}`);
    const clubs = await res.json();

    if (clubs.length === 0) {
      clubDropdownList.innerHTML = `<div class="text-gray-500 px-4 py-2">無社團可選</div>`;
    } else {
      clubs.forEach(club => {
        const item = document.createElement("a");
        item.href = `club.html?clubId=${club.club_id}`;
        item.textContent = `${club.club_id} ${club.club_name}`;
        item.className = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
        clubDropdownList.appendChild(item);
      });
    }
  } catch (err) {
    console.error("切換社團清單載入失敗：", err);
    clubDropdownList.innerHTML = `<div class="text-red-500 px-4 py-2">讀取錯誤</div>`;
  }

  // ✅ 顯示 / 隱藏選單
  clubNameBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clubDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    clubDropdown.classList.add("hidden");
  });

  // ✅ Hover / 固定三大選單 + 動態帶入 student_id
  let fixedMenu = null;

  document.querySelectorAll(".menu-wrapper").forEach(wrapper => {
    const menuId = wrapper.dataset.menu;
    const menuEl = document.getElementById(menuId);

    wrapper.addEventListener("mouseenter", () => {
      if (fixedMenu !== menuId) menuEl.classList.remove("hidden");
    });

    wrapper.addEventListener("mouseleave", () => {
      if (fixedMenu !== menuId) menuEl.classList.add("hidden");
    });

    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      if (fixedMenu === menuId) {
        fixedMenu = null;
        menuEl.classList.add("hidden");
      } else {
        document.querySelectorAll(".menu-wrapper .absolute").forEach(el => el.classList.add("hidden"));
        menuEl.classList.remove("hidden");
        fixedMenu = menuId;
      }
    });
  });

  document.addEventListener("click", () => {
    fixedMenu = null;
    document.querySelectorAll(".menu-wrapper .absolute").forEach(el => el.classList.add("hidden"));
  });

  // ✅ 更新四個會員管理選單連結為帶入 student_id
  const links = {
    profile: document.querySelector("a[href='member-profile.html']"),
    list: document.querySelector("a[href='member-list.html']"),
    detail: document.querySelector("a[href='member-detail.html']"),
    role: document.querySelector("a[href='role-management.html']")
  };

  if (links.profile) links.profile.href = `member-profile.html?clubId=${clubId}&student_id=${studentId}`;
  if (links.list) links.list.href = `member-list.html?clubId=${clubId}&student_id=${studentId}`;
  if (links.detail) links.detail.href = `member-detail.html?clubId=${clubId}&student_id=${studentId}`;
  if (links.role) links.role.href = `role-management.html?clubId=${clubId}&student_id=${studentId}`;
});
