// public/member-profile.js
(async () => {
  /* 解析 clubId / student_id ------------------------------------------------ */
  const params = new URLSearchParams(location.search);
  const clubId = params.get('clubId') || sessionStorage.getItem('clubId');
  const targetId = params.get('student_id') || localStorage.getItem('studentId');

  if (!clubId) return alert('缺少 clubId');
  if (!targetId) return alert('缺少 student_id');

  /* 抓個人資料 -------------------------------------------------------------- */
  try {
    const res = await fetch(`/api/member/profile/${targetId}`, {
      headers: {
        'X-Student-Id': localStorage.getItem('studentId') || '',
        'X-Club-Id': clubId
      }
    });
    if (!res.ok) throw await res.text();
    const { member, clubs } = await res.json();

    /* 畫面渲染 (略) --------------------------------------------------------- */
    renderProfile(member);
    renderClubHistory(clubs);

  } catch (e) {
    console.error('載入個人資料失敗', e);
    alert('載入失敗');
  }
})();

/* ---------- 以下是原本就有的畫面渲染函式 (沒改邏輯，只列在這方便你對照) ----- */
function renderProfile(m) {
  document.getElementById('profile').innerHTML = `
    <p><strong>學號：</strong>${m.student_id}</p>
    <p><strong>姓名：</strong>${m.name}</p>
    <p><strong>系所：</strong>${m.department}</p>
    <p><strong>年級：</strong>${m.grade}</p>
    <p><strong>電話：</strong>${m.phone}</p>
    <p><strong>Email：</strong>${m.email}</p>
    <p><strong>緊急聯絡人：</strong>${m.emergency_contact_name}（${m.emergency_contact_phone}）</p>
    <p><strong>飲食習慣：</strong>${m.diet}</p>
    <p><strong>入會日期：</strong>${m.join_date ? m.join_date.slice(0, 10) : ''}</p>
  `;
}
function renderClubHistory(list) {
  const ul = document.getElementById('club-history');
  ul.innerHTML = list.map(c =>
    `<li>${c.join_semester}　${c.club_id} ${c.club_name}（${c.role_name}）</li>`
  ).join('');
}
