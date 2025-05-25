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
        item.href = `club.html?clubId=${club.club_id}&student_id=${studentId}`;
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

  // ✅ 更新所有選單連結為帶入 student_id 和 clubId
  const updateLinks = () => {
    const links = {
      memberProfile: document.querySelector("a[href='member-profile.html']"),
      memberList: document.querySelector("a[href='member-list.html']"),
      roleManagement: document.querySelector("a[href='role-management.html']"),
      assets: document.querySelector("a[href='assets.html']"),
      borrowLogs: document.querySelector("a[href='borrow-logs.html']"),
      feeEdit: document.querySelector("a[href='fee-edit.html']"),
      feeOverview: document.querySelector("a[href='fee-overview.html']"),
      paymentRecord: document.querySelector("a[href='payment-record.html']"),
      paymentStatus: document.querySelector("a[href='payment-status.html']"),
      personalPayment: document.querySelector("a[href='personal-payment.html']")
    };

    Object.entries(links).forEach(([key, link]) => {
      if (link) {
        const baseUrl = link.getAttribute('href').split('?')[0];
        link.href = `${baseUrl}?clubId=${clubId}&student_id=${studentId}`;
      }
    });
  };

  // 立即更新所有連結
  updateLinks();
});

// 資產管理相關函數
async function getAssetList(clubId) {
  try {
    const response = await fetch(`/api/asset/list?clubId=${clubId}`);
    if (!response.ok) throw new Error('Failed to fetch asset list');
    return await response.json();
  } catch (error) {
    console.error('Error fetching asset list:', error);
    throw error;
  }
}

async function addAsset(clubId, assetData) {
  try {
    const response = await fetch('/api/asset/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clubId,
        ...assetData
      })
    });
    if (!response.ok) throw new Error('Failed to add asset');
    return await response.json();
  } catch (error) {
    console.error('Error adding asset:', error);
    throw error;
  }
}

async function updateAsset(assetId, clubId, assetData) {
  try {
    const response = await fetch(`/api/asset/update/${assetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clubId,
        ...assetData
      })
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return await response.json();
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
}

async function deleteAsset(assetId, clubId) {
  try {
    const response = await fetch(`/api/asset/delete/${assetId}?clubId=${clubId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete asset');
    return await response.json();
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
}

// 檢查資產管理權限
async function checkAssetPermission(clubId, studentId) {
  try {
    const response = await fetch(`/api/member/role-permission/${clubId}/${studentId}`, {
      headers: {
        'X-Student-Id': studentId,
        'X-Club-Id': clubId
      }
    });
    if (!response.ok) throw new Error('Failed to check permission');
    const data = await response.json();
    return {
      canManage: data.can_manage_asset === 1,
      canBorrow: true // 所有人都可以借用社產
    };
  } catch (error) {
    console.error('Error checking asset permission:', error);
    return { canManage: false, canBorrow: false };
  }
}

// 借用社產
async function borrowAsset(clubId, assetId, studentId, borrowData) {
  try {
    const response = await fetch('/api/asset/borrow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Student-Id': studentId,
        'X-Club-Id': clubId
      },
      body: JSON.stringify({
        clubId,
        assetId,
        studentId,
        ...borrowData
      })
    });
    if (!response.ok) throw new Error('Failed to borrow asset');
    return await response.json();
  } catch (error) {
    console.error('Error borrowing asset:', error);
    throw error;
  }
}

// 歸還社產
async function returnAsset(clubId, assetId, studentId) {
  try {
    const response = await fetch('/api/asset/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Student-Id': studentId,
        'X-Club-Id': clubId
      },
      body: JSON.stringify({
        clubId,
        assetId,
        studentId
      })
    });
    if (!response.ok) throw new Error('Failed to return asset');
    return await response.json();
  } catch (error) {
    console.error('Error returning asset:', error);
    throw error;
  }
}

// 獲取借用記錄
async function getBorrowRecords(clubId, assetId = null) {
  try {
    const url = assetId 
      ? `/api/asset/borrow-records?clubId=${clubId}&assetId=${assetId}`
      : `/api/asset/borrow-records?clubId=${clubId}`;
    const response = await fetch(url, {
      headers: {
        'X-Student-Id': localStorage.getItem('studentId'),
        'X-Club-Id': clubId
      }
    });
    if (!response.ok) throw new Error('Failed to fetch borrow records');
    return await response.json();
  } catch (error) {
    console.error('Error fetching borrow records:', error);
    throw error;
  }
}
