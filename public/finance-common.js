// ✅ 取得 clubId（優先從 URL，其次 sessionStorage）
export function getClubId() {
    const urlClub = new URLSearchParams(location.search).get('clubId');
    if (urlClub) {
        sessionStorage.setItem('clubId', urlClub);
        return urlClub;
    }

    const stored = sessionStorage.getItem('clubId');
    if (stored) return stored;

    alert('請先選擇社團！');
    window.location.href = '/index.html';
    return null;
}

// ✅ API 請求工具
const API = '/api';

export async function apiGet(url) {
    const res = await fetch(API + url);
    if (!res.ok) throw await res.text();
    return res.json();
}

export async function apiSend(url, method, body) {
    const res = await fetch(API + url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body)
    });
    if (!res.ok) throw await res.text();
    return res.json();
}

// ✅ 日期格式化工具
export const fmt = (d) => new Date(d).toISOString().slice(0, 10);
export const toast = (msg) => alert(msg);

// ✅ 自動補全 clubId 並跳轉
export function navigateWithClubId(targetPage) {
    const clubId = getClubId();
    const separator = targetPage.includes('?') ? '&' : '?';
    window.location.href = `${targetPage}${separator}clubId=${clubId}`;
}

// ✅ 自動補全所有頁面 <a> 超連結的 clubId（放在頁面中直接生效）
export function autoAppendClubIdToLinks() {
    const clubId = getClubId();
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('clubId=')) {
            const separator = href.includes('?') ? '&' : '?';
            link.setAttribute('href', `${href}${separator}clubId=${clubId}`);
        }
    });
}

// ✅ 一進入頁面就自動補全 <a> 的 href（非必要的頁面可不用調用）
document.addEventListener('DOMContentLoaded', () => {
    autoAppendClubIdToLinks();
});

function authHeaders(extra = {}) {
    return {
        'Content-Type': 'application/json',
        'X-Student-Id': localStorage.getItem('studentId') || '',
        'X-Club-Id': sessionStorage.getItem('clubId') || '',
        ...extra
    };
}

// 處理財務管理選單連結
export function setupFinanceMenu() {
    const clubId = getClubId();
    const studentId = localStorage.getItem('studentId');

    // 獲取所有財務管理相關的連結
    const feeEditBtn = document.getElementById('menu-fee-edit');
    const payRecBtn = document.getElementById('menu-pay-record');
    const payStatusBtn = document.getElementById('menu-pay-status');
    const feeOverviewLink = document.querySelector('a[href="fee-overview.html"]');
    const personalPaymentLink = document.querySelector('a[href="personal-payment.html"]');

    // 設定連結事件
    if (feeEditBtn) {
        feeEditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `fee-edit.html?clubId=${clubId}&student_id=${studentId}&from=club`;
        });
    }

    if (payRecBtn) {
        payRecBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `payment-record.html?clubId=${clubId}&student_id=${studentId}&from=club`;
        });
    }

    if (payStatusBtn) {
        payStatusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `payment-status.html?clubId=${clubId}&student_id=${studentId}&from=club`;
        });
    }

    if (feeOverviewLink) {
        feeOverviewLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `fee-overview.html?clubId=${clubId}&student_id=${studentId}&from=club`;
        });
    }

    if (personalPaymentLink) {
        personalPaymentLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `personal-payment.html?clubId=${clubId}&student_id=${studentId}&from=club`;
        });
    }
}