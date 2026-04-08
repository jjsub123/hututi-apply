document.addEventListener('DOMContentLoaded', () => {
  // 모달 제어 요소를 안전하게 가져오기 (try-catch로 전체 감싸기)
  try {
    // 1. 전역 Supabase 연동 변수 (본인 키로 변경 필요)
    const SUPABASE_URL = 'https://fsbwzgumzkhplotgqpmr.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzYnd6Z3VtemtocGxvdGdxcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MjUyODcsImV4cCI6MjA5MDUwMTI4N30.mLOXdxtWFpIuDPtk5AF2jLnX4AA2tVId95KIyFAQoO4'; 
    
    let supabaseClient = null;
    if (window.supabase) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.warn("Supabase CDN이 로드되지 않았습니다.");
    }

    const modal = document.getElementById('applyModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const applyForm = document.getElementById('applyForm');
    const submitBtn = document.getElementById('submitBtn');
    const openTriggers = document.querySelectorAll('.trigger-apply');

    // 모달 상태 제어
    const closeModal = () => {
      if (modal) modal.classList.remove('active');
      if (applyForm) applyForm.reset();
    };

    // 여는 버튼 이벤트 연결
    if (openTriggers && openTriggers.length > 0) {
      openTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (modal) {
            modal.classList.add('active');
          } else {
            alert('모달 요소를 찾을 수 없습니다.');
          }
        });
      });
    }

    // 닫는 버튼 이벤트 연결
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // 배경 클릭 시 닫기
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    // 폼 제출 이벤트
    if (applyForm) {
      applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 동의 체크 확인
        const consent = document.getElementById('consent');
        if (consent && !consent.checked) {
          alert("개인정보 수집 및 이용에 동의해주세요.");
          return;
        }

        if(!supabaseClient) {
          alert('데이터베이스(Supabase) 설정이 완료되지 않았습니다.');
          return;
        }

        // 입력 데이터 수집
        const name = document.getElementById('name') ? document.getElementById('name').value : '';
        const address = document.getElementById('address') ? document.getElementById('address').value : '';
        const phone = document.getElementById('phone') ? document.getElementById('phone').value : '';
        const invite_code = document.getElementById('invite_code') ? document.getElementById('invite_code').value : '';

        // 5. 서버 전송
        if (submitBtn) {
          submitBtn.textContent = '제출 중...';
          submitBtn.disabled = true;
        }

        try {
          const { error } = await supabaseClient
            .from('waitlist')
            .insert([
              { 
                name: name,
                address: address, 
                phone: phone, 
                invite_code: invite_code,
                consent: consent.checked
              }
            ]);

          if (error) throw error;

          alert("입장 대기 신청이 완료되었습니다! 5명 이상 모여 클럽이 개설되면 문자로 안내해 드리겠습니다.");
          closeModal();
        } catch (err) {
          console.error(err);
          alert("오류가 발생했습니다. (키 설정과 테이블 생성이 완료되었는지 확인해주세요!)");
        } finally {
          if (submitBtn) {
            submitBtn.textContent = '가입 신청하기';
            submitBtn.disabled = false;
          }
        }
      });
    }
    // 맨 위로 가기 버튼 및 상단 스크롤 알림창 제어
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollNotice = document.getElementById('scrollNotice');
    const closeNoticeBtn = document.getElementById('closeNoticeBtn');
    const fabWriteBtn = document.getElementById('fabWriteBtn');
    let isNoticeClosed = false;

    if (closeNoticeBtn) {
      closeNoticeBtn.addEventListener('click', () => {
        isNoticeClosed = true;
        if (scrollNotice) scrollNotice.classList.remove('visible');
      });
    }

    // 공통 스크롤 이벤트
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 200;
      
      if (scrollToTopBtn) {
        if (scrolled) scrollToTopBtn.classList.add('visible');
        else scrollToTopBtn.classList.remove('visible');
      }

      if (scrollNotice) {
        const isHomeTab = document.querySelector('.tab[data-tab="tab-home"]').classList.contains('active');
        if (scrolled && !isNoticeClosed && isHomeTab) scrollNotice.classList.add('visible');
        else scrollNotice.classList.remove('visible');
      }

      // FAB 로직 (커뮤니티 탭에서만 보이고, 살짝 내렸을 때 노출)
      if (fabWriteBtn) {
        const isCommunityTab = document.querySelector('.tab[data-tab="tab-community"]').classList.contains('active');
        if (isCommunityTab && window.scrollY > 100) {
          fabWriteBtn.style.display = 'flex';
        } else {
          fabWriteBtn.style.display = 'none';
        }
      }
    });

    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 개인정보 처리방침 모달 제어
    const privacyModal = document.getElementById('privacyModal');
    const openPrivacyBtn = document.getElementById('openPrivacyBtn');
    const closePrivacyBtn = document.getElementById('closePrivacyBtn');

    if (openPrivacyBtn && privacyModal) {
      openPrivacyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.classList.add('active');
      });
    }

    const closePrivacy = () => {
      if (privacyModal) privacyModal.classList.remove('active');
    };

    if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closePrivacy);
    
    if (privacyModal) {
      privacyModal.addEventListener('click', (e) => {
        if (e.target === privacyModal) closePrivacy();
      });
    }

    // --- 신규 기능: 로그인 및 탭 전환 로직 ---
    const demoAccounts = {
      boss: { id: 'boss', password: '1234', displayName: '내일 사장님', role: 'owner' },
      empty_owner: { id: 'empty_owner', password: '1234', displayName: '새로운 사장님', role: 'owner' },
      expert_guide: { id: 'expert_guide', password: 'Qna!2026Pro', displayName: '전문가', role: 'expert' }
    };

    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (error) {
      currentUser = null;
    }
    if (isLoggedIn && !currentUser) currentUser = demoAccounts.boss;

    const LEGACY_AUTHOR_ID_MAP = {
      '내일 사장님': 'boss',
      '내일사장': 'boss',
      'Owner': 'boss',
      '전문가': 'expert_guide'
    };

    const getCurrentUserId = () => currentUser?.id || '';
    const getCurrentUserDisplayName = () => currentUser?.displayName || '내일 사장님';
    const getCurrentUserRole = () => currentUser?.role || 'owner';
    const resolveLegacyAuthorId = (author = '') => LEGACY_AUTHOR_ID_MAP[String(author || '').trim()] || null;
    const getEffectiveAuthorId = (recordOrAuthor = '', fallbackRole = '') => {
      if (recordOrAuthor && typeof recordOrAuthor === 'object') {
        return recordOrAuthor.effectiveAuthorId
          || recordOrAuthor.author_id
          || resolveLegacyAuthorId(recordOrAuthor.author || '');
      }
      return resolveLegacyAuthorId(String(recordOrAuthor || '').trim());
    };
    const getEffectiveAuthorRole = (record = {}, fallbackRole = '') => {
      if (record.author_role) return record.author_role;
      const effectiveAuthorId = getEffectiveAuthorId(record);
      if (effectiveAuthorId === 'expert_guide') return 'expert';
      if (effectiveAuthorId) return 'owner';
      return fallbackRole || '';
    };
    const isExpertAuthor = (author = '', authorRole = '') => authorRole === 'expert' || String(author || '').startsWith('전문가');
    const isCurrentUsersAuthor = (recordOrAuthor = '', fallbackRole = '') => {
      return getEffectiveAuthorId(recordOrAuthor, fallbackRole) === getCurrentUserId();
    };
    const getAuthorAvatarClass = (author = '', authorRole = '') => isExpertAuthor(author, authorRole) ? 'bg-red' : 'bg-blue';
    const getAuthorDisplayHtml = (author = '', authorRole = '') => {
      if (!isExpertAuthor(author, authorRole)) return author;
      return `${author} <span class="author-badge">인증</span>`;
    };
    const getCurrentAuthorHtml = () => getAuthorDisplayHtml(getCurrentUserDisplayName(), getCurrentUserRole());
    
    const loginModal = document.getElementById('loginModal');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const loginForm = document.getElementById('loginForm');
    const btnLogout = document.getElementById('btnLogout');
    const displayUserId = document.getElementById('displayUserId');
    
    if(isLoggedIn) {
      if(btnLogout) btnLogout.style.display = 'block';
      if(displayUserId) displayUserId.textContent = getCurrentUserDisplayName();
    }

    const tabs = document.querySelectorAll('.nav-tabs .tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const homeActions = document.getElementById('homeActions');
    const TAB_SECTION_TO_ID = {
      intro: 'tab-home',
      community: 'tab-community',
      mypage: 'tab-mypage'
    };
    const TAB_ID_TO_SECTION = Object.fromEntries(
      Object.entries(TAB_SECTION_TO_ID).map(([section, id]) => [id, section])
    );
    let pendingProtectedRoute = null;
    let lockedRouteTabId = null;

    const canAccessProtectedTabs = () => isLoggedIn;
    const isProtectedSection = (section = 'intro') => section !== 'intro';
    const parseHashRoute = (hash = window.location.hash) => {
      const raw = String(hash || '').replace(/^#/, '').trim();
      if (!raw) return { section: 'intro', rest: [], fullHash: '#intro' };
      const parts = raw.split('/').filter(Boolean);
      const [section = 'intro', ...rest] = parts;
      return {
        section,
        rest,
        fullHash: `#${[section, ...rest].join('/')}`
      };
    };
    const normalizeRoute = (inputRoute) => {
      const route = typeof inputRoute === 'string' ? parseHashRoute(inputRoute) : (inputRoute || {});
      const section = TAB_SECTION_TO_ID[route.section] ? route.section : 'intro';
      const rest = section === 'intro' ? [] : (Array.isArray(route.rest) ? route.rest.filter(Boolean) : []);
      return {
        section,
        rest,
        fullHash: `#${[section, ...rest].join('/')}`
      };
    };
    const clearRouteLock = () => {
      if (!lockedRouteTabId) return;
      const pane = document.getElementById(lockedRouteTabId);
      if (pane) pane.classList.remove('is-route-locked');
      lockedRouteTabId = null;
    };
    const lockRoutePane = (targetId) => {
      clearRouteLock();
      const pane = document.getElementById(targetId);
      if (!pane) return;
      pane.classList.add('is-route-locked');
      lockedRouteTabId = targetId;
    };
    const openLoginModal = () => {
      if (loginModal) loginModal.classList.add('active');
    };

    // 로그인 모달 닫기
    const closeLoginModal = ({ preserveRoute = false } = {}) => {
      if (loginModal) loginModal.classList.remove('active');
      if (!preserveRoute && lockedRouteTabId) {
        pendingProtectedRoute = null;
        clearRouteLock();
        applyRoute({ section: 'intro', rest: [], fullHash: '#intro' }, { updateHash: true });
      }
    };

    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLoginModal);
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
      });
    }
    
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        isLoggedIn = false;
        currentUser = null;
        pendingProtectedRoute = null;
        clearRouteLock();
        btnLogout.style.display = 'none';
        if(displayUserId) displayUserId.textContent = '로그인이 필요해요';
        alert('로그아웃 되었습니다.');
        refreshUserScopedUi();
        switchTab('tab-home');
      });
    }

    // 로그인 폼 제출 (단순 가짜 로그인 처리)
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const userPw = document.getElementById('userPw').value;

        const matchedAccount = Object.values(demoAccounts).find(account => {
          return account.id === userId && account.password === userPw;
        });
        
        if (matchedAccount) {
          isLoggedIn = true;
          localStorage.setItem('isLoggedIn', 'true');
          currentUser = matchedAccount;
          localStorage.setItem('currentUser', JSON.stringify(matchedAccount));
          alert(`로그인되었습니다. ${matchedAccount.displayName}님 환영합니다!`);
          
          if (displayUserId) displayUserId.textContent = matchedAccount.displayName;
          if (btnLogout) btnLogout.style.display = 'block';
          refreshUserScopedUi();

          const resumeRoute = pendingProtectedRoute ? parseHashRoute(pendingProtectedRoute) : null;
          pendingProtectedRoute = null;
          clearRouteLock();
          closeLoginModal({ preserveRoute: true });

          if (resumeRoute) {
            applyRoute(resumeRoute, { updateHash: true });
          } else {
            // 일반 로그인은 기존처럼 커뮤니티 탭으로 연결
            switchTab('tab-community');
          }
        } else {
          alert('존재하지 않는 아이디거나 비밀번호가 일치하지 않습니다.\n※ 테스트 계정: boss / 1234, empty_owner / 1234, expert_guide / Qna!2026Pro');
        }
      });
    }

    const renderTab = (targetId, { scrollTop = true } = {}) => {
      // UI 업데이트
      tabs.forEach(t => t.classList.remove('active'));
      const activeTab = document.querySelector(`[data-tab="${targetId}"]`);
      if (activeTab) activeTab.classList.add('active');

      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.style.display = 'block';
        } else {
          pane.style.display = 'none';
        }
      });

      // 하단 '신청하기' 플로팅 버튼은 홈탭에서만 노출
      if (homeActions) {
        if (targetId === 'tab-home') homeActions.style.display = 'flex';
        else homeActions.style.display = 'none';
      }

      // 탭 바뀔때 마다 글쓰기 플로팅 버튼 다시 평가
      if (fabWriteBtn) {
        if (targetId === 'tab-community' && window.scrollY > 100) fabWriteBtn.style.display = 'flex';
        else fabWriteBtn.style.display = 'none';
      }

      // 상단 스크롤
      if (scrollTop) window.scrollTo(0, 0);
    };

    const applyRoute = (inputRoute, { updateHash = false, fromPopstate = false, allowLockedView = true } = {}) => {
      const route = normalizeRoute(inputRoute);
      if (updateHash && window.location.hash !== route.fullHash) {
        window.location.hash = route.fullHash;
        return;
      }

      const targetId = TAB_SECTION_TO_ID[route.section] || 'tab-home';

      if (isProtectedSection(route.section) && !canAccessProtectedTabs()) {
        pendingProtectedRoute = route.fullHash;
        renderTab(targetId, { scrollTop: !fromPopstate });
        if (allowLockedView) lockRoutePane(targetId);
        openLoginModal();
        return;
      }

      pendingProtectedRoute = null;
      clearRouteLock();
      renderTab(targetId, { scrollTop: !fromPopstate });
    };

    // 탭 전환 함수
    const switchTab = (targetId) => {
      const section = TAB_ID_TO_SECTION[targetId] || 'intro';
      applyRoute({ section, rest: [], fullHash: `#${section}` }, { updateHash: true });
    };

    // 탭 클릭 이벤트
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = tab.getAttribute('data-tab');
        switchTab(targetId);
      });
    });

    window.addEventListener('hashchange', () => {
      applyRoute(parseHashRoute(window.location.hash), { fromPopstate: true, allowLockedView: true });
    });

    applyRoute(parseHashRoute(window.location.hash), { updateHash: true, allowLockedView: true });

    // --- 신규 기능: 데일리 상태 체크 로직 ---
    const statusChecks = [
      { id: 'sc1', tagClass: 'tag-blue',   tagText: '단골/신규',  text: '단골, 신규 고객의 비중', placeholder: '오늘 단골 손님과 신규 손님의 비율이 어땠나요?' },
      { id: 'sc2', tagClass: 'tag-green',  tagText: '직원',      text: '직원, 시간제 운영',       placeholder: '직원·파트타임 운영 상황을 기록해주세요.' },
      { id: 'sc3', tagClass: 'tag-orange', tagText: '마케팅',    text: '마케팅 운영 (추가·진행·종료)', placeholder: '진행 중인 마케팅이 있나요? 새로 시작하거나 종료한 마케팅도 적어주세요.' },
      { id: 'sc4', tagClass: 'tag-purple', tagText: '고객층',    text: '방문 고객 연령층과 구성',  placeholder: '오늘 방문한 고객의 연령대와 유형을 기록해주세요.' },
      { id: 'sc5', tagClass: 'tag-blue',   tagText: '홀/배달',   text: '홀, 배달 비중',           placeholder: '오늘 홀 손님과 배달 주문의 비율을 기록해주세요.' },
      { id: 'sc6', tagClass: 'tag-red',    tagText: '인근 상권', text: '인근 상권의 새로운 이슈',  placeholder: '신규 창업, 폐업, 공사 등 상권 변화를 기록해주세요.' },
      { id: 'sc7', tagClass: 'tag-orange', tagText: '집기/물품', text: '가게 내 집기, 물품 변동',  placeholder: '오늘 교체하거나 추가·제거한 물품이 있나요?' },
      { id: 'sc8', tagClass: 'tag-green',  tagText: '기타',      text: '기타',                    placeholder: '위 항목 외 기록하고 싶은 내용을 자유롭게 적어주세요.' },
    ];
    
    // 1단계: 체크리스트 렌더링
    const renderStep1 = () => {
      const statusCheckList = document.getElementById('statusCheckList');
      if (!statusCheckList) return;
      statusCheckList.innerHTML = statusChecks.map(m => `
        <label class="status-log-item">
          <input type="checkbox" class="mission-checkbox active-checkbox" data-id="${m.id}" data-color="${m.tagClass}" data-tag="${m.tagText}" data-text="${m.text}" data-placeholder="${m.placeholder}">
          <div class="log-chip">
            <span class="log-chip-text">${m.text}</span>
          </div>
        </label>
      `).join('');

      const checkboxes = document.querySelectorAll('.active-checkbox');
      checkboxes.forEach(chk => {
        chk.addEventListener('change', () => {
          const item = chk.closest('.status-log-item');
          if (chk.checked) item && item.classList.add('completed');
          else item && item.classList.remove('completed');
        });
      });
    };
    renderStep1();

    // 2단계: 선택된 항목별 입력창 렌더링
    const renderStep2 = () => {
      const checked = [...document.querySelectorAll('.active-checkbox:checked')];
      const container = document.getElementById('logDetailInputs');
      if (!container) return;
      if (checked.length === 0) {
        // 아무것도 선택 안 됐으면 1단계 유지
        return false;
      }
      container.innerHTML = checked.map(chk => `
        <div class="log-detail-group">
          <label class="log-detail-label">
            <span class="tag ${chk.dataset.color}">${chk.dataset.tag}</span>
            <span class="log-detail-title">${chk.dataset.text}</span>
          </label>
          <textarea class="form-textarea log-detail-input" data-tag="${chk.dataset.tag}" placeholder="${chk.dataset.placeholder}" rows="2" style="margin-bottom:0;"></textarea>
        </div>
      `).join('');
      return true;
    };

    // 2단계 이동 버튼
    const btnGoStep2 = document.getElementById('btnGoStep2');
    if (btnGoStep2) {
      btnGoStep2.addEventListener('click', () => {
        const ok = renderStep2();
        if (!ok) { alert('오늘 해당하는 항목을 1개 이상 선택해주세요.'); return; }
        document.getElementById('logStep1').style.display = 'none';
        document.getElementById('logStep2').style.display = 'block';
      });
    }
    // --- 로그 모달 제어 로직 ---
    const logModal = document.getElementById('logModal');
    const btnOpenLogModal = document.getElementById('btnOpenLogModal');
    const closeLogBtn = document.getElementById('closeLogBtn');
    const closeLogBtn2 = document.getElementById('closeLogBtn2');
    const submitLogBtn = document.getElementById('submitLogBtn');
    const btnBackStep1 = document.getElementById('btnBackStep1');

    // 모달 열기/닫기
    const openLogModal = () => {
      if (!isLoggedIn) { if (loginModal) loginModal.classList.add('active'); return; }
      // 항상 1단계부터 시작
      document.getElementById('logStep1').style.display = 'block';
      document.getElementById('logStep2').style.display = 'none';
      renderStep1();
      if (logModal) logModal.classList.add('active');
    };
    const closeLogModalObj = () => { if (logModal) logModal.classList.remove('active'); };

    if (btnOpenLogModal) btnOpenLogModal.addEventListener('click', openLogModal);
    if (closeLogBtn)  closeLogBtn.addEventListener('click', closeLogModalObj);
    if (closeLogBtn2) closeLogBtn2.addEventListener('click', closeLogModalObj);
    if (btnBackStep1) {
      btnBackStep1.addEventListener('click', () => {
        document.getElementById('logStep1').style.display = 'block';
        document.getElementById('logStep2').style.display = 'none';
      });
    }
    if (logModal) {
      logModal.addEventListener('click', (e) => { if (e.target === logModal) closeLogModalObj(); });
    }

    if (submitLogBtn) {
      submitLogBtn.addEventListener('click', async () => {
        // 2단계 입력 내용 수집
        const detailInputs = document.querySelectorAll('.log-detail-input');
        let combinedText = '';
        detailInputs.forEach(inp => {
          if (inp.value.trim()) combinedText += `[${inp.dataset.tag}] ${inp.value.trim()}\n`;
        });
        closeLogModalObj();
        setTimeout(async () => {
          if (!confirm('기록 완료! 운영기록을 게시판에 공유할까요?')) return;

          if(!supabaseClient) {
            alert('DB 연결이 필요합니다.');
            return;
          }

          const retro_tags = [...document.querySelectorAll('.active-checkbox:checked')].map(chk => {
            return `<span class="tag ${chk.dataset.color}">${chk.dataset.tag}</span> ${chk.dataset.text}<br>`;
          }).join('');

          const { error } = await supabaseClient.from('posts').insert([{
            board_type: 'retro',
            author: getCurrentUserDisplayName(),
            author_id: getCurrentUserId(),
            author_role: getCurrentUserRole(),
            content: `<strong>오늘 매장 상태 기록</strong><br>${combinedText.trim().replace(/\n/g, '<br>')}`,
            retro_tags: retro_tags ? `<div style="background:var(--bg-color); padding:10px; border-radius:8px; margin-bottom:12px; font-size:13px; color:var(--text-main); line-height:1.4;">${retro_tags}</div>` : null
          }]);

          if (error) {
            console.error(error);
            alert('운영기록 등록 중 오류가 발생했습니다.');
            return;
          }

          alert('운영기록이 등록되었습니다.');
          document.querySelector('.board-tab[data-board="board-free"]').click();
          if(typeof fetchPosts === 'function') fetchPosts();
        }, 100);
      });
    }

    // --- 피드 (게시판) 상호작용 및 글쓰기 로직 ---
    const attachFeedCardEvents = (card) => {
      const btnLike = card.querySelector('.btn-like');
      const btnCommentToggle = card.querySelector('.btn-comment');
      const feedCommentsArea = card.querySelector('.feed-comments');
      const submitCommentBtn = card.querySelector('.submit-comment');
      const commentInput = card.querySelector('.comment-input');
      const commentList = card.querySelector('.comment-list');
      const commentCountSpan = btnCommentToggle ? btnCommentToggle.querySelector('.count') : null;
      
      // 피드 전체 클릭 시 댓글창 토글
      card.addEventListener('click', (e) => {
        // 하트나 댓글 입력 인풋을 눌렀을 때는 카드 전체 토글 방지
        if (e.target.closest('.action-btn') || e.target.closest('.comment-input-area')) return;
        
        if (feedCommentsArea.style.display === 'none' || !feedCommentsArea.style.display) {
          feedCommentsArea.style.display = 'block';
        } else {
          feedCommentsArea.style.display = 'none';
        }
      });

      // 좋아요 로직
      if (btnLike) {
        btnLike.addEventListener('click', (e) => {
          e.stopPropagation();
          const countSpan = btnLike.querySelector('.count');
          const iconSpan = btnLike.querySelector('.icon');
          const isActived = btnLike.classList.contains('active');
          
          if(isActived) {
            btnLike.classList.remove('active');
            if (iconSpan) iconSpan.innerHTML = '<i class="ri-heart-3-line" aria-hidden="true"></i>';
            if(countSpan) countSpan.textContent = parseInt(countSpan.textContent) - 1;
          } else {
            btnLike.classList.add('active');
            if (iconSpan) iconSpan.innerHTML = '<i class="ri-heart-3-fill" aria-hidden="true"></i>';
            if(countSpan) countSpan.textContent = parseInt(countSpan.textContent) + 1;
          }
        });
      }

      // 댓글 달기 버튼 호버/로직
      if (btnCommentToggle) {
        btnCommentToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          if (feedCommentsArea.style.display === 'none' || !feedCommentsArea.style.display) {
            feedCommentsArea.style.display = 'block';
            if(commentInput) commentInput.focus();
          } else {
            feedCommentsArea.style.display = 'none';
          }
        });
      }

      // 실제 댓글 작성 등록 (DB 연동)
      if (submitCommentBtn && commentInput && commentList && commentCountSpan) {
        submitCommentBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const commentText = commentInput.value;
          if(!commentText.trim()) return;
          
          if(!supabaseClient) {
            alert('DB 연결이 필요합니다.');
            return;
          }

          const postId = card.getAttribute('data-post-id');
          // UUID는 36자이므로 짧으면 더미 카드(1, 2)로 간주
          if(!postId || postId.length < 30) {
            // 더미 카드의 경우 로컬로만 추가
            const emptyNode = commentList.querySelector('.empty-comment');
            if(emptyNode) emptyNode.remove();

            const newComment = document.createElement('div');
            newComment.className = 'comment-item';
            newComment.innerHTML = `
              <span class="comment-author">${getCurrentAuthorHtml()}</span> ${commentText}
            `;
            commentList.appendChild(newComment);
            commentCountSpan.textContent = parseInt(commentCountSpan.textContent) + 1;
            commentInput.value = '';
            return;
          }

          submitCommentBtn.disabled = true;
          submitCommentBtn.textContent = '등록중';

          const { error } = await supabaseClient.from('comments').insert([{
            post_id: postId,
            author: getCurrentUserDisplayName(),
            author_id: getCurrentUserId(),
            author_role: getCurrentUserRole(),
            content: commentText
          }]);

          if (error) {
            console.error(error);
            alert('댓글 작성 중 오류가 발생했습니다.');
            submitCommentBtn.disabled = false;
            submitCommentBtn.textContent = '등록';
            return;
          }

          // 로컬 DOM에 즉시 반영
          const emptyNode = commentList.querySelector('.empty-comment');
          if(emptyNode) emptyNode.remove();
          
          const newComment = document.createElement('div');
          newComment.className = 'comment-item';
          newComment.innerHTML = `
            <span class="comment-author">${getCurrentAuthorHtml()}</span> ${commentText}
          `;
          commentList.appendChild(newComment);
          if(commentCountSpan) commentCountSpan.textContent = parseInt(commentCountSpan.textContent) + 1;

          commentInput.value = '';
          submitCommentBtn.disabled = false;
          submitCommentBtn.textContent = '등록';
          
          if(typeof fetchPosts === 'function') fetchPosts();
        });
      }
    };

    const feedCards = document.querySelectorAll('.feed-card');
    feedCards.forEach(attachFeedCardEvents);
    document.querySelectorAll('.comment-input').forEach(input => {
      input.placeholder = '\uC9C8\uBB38\uC774\uB098 \uC758\uACAC\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694';
    });

    // 글쓰기 모달 제어 (액션 시트 연결)
    const writeActionSheet = document.getElementById('writeActionSheet');
    const writeModal = document.getElementById('writeModal');
    const closeWriteBtn = document.getElementById('closeWriteBtn');
    const cancelWriteBtn = document.getElementById('cancelWriteBtn');
    const postTitleInput = document.getElementById('postTitle');
    const writeModalDesc = document.getElementById('writeModalDesc');
    let currentWriteType = 'free';
    
    if (fabWriteBtn) {
      fabWriteBtn.addEventListener('click', () => {
        if (!isLoggedIn) {
          if (loginModal) loginModal.classList.add('active');
          return;
        }
        if (writeActionSheet) writeActionSheet.classList.add('active');
      });
    }

    const closeWriteModal = () => {
      if (writeModal) writeModal.classList.remove('active');
      if (postTitleInput) postTitleInput.value = '';
      if (postContent) postContent.value = '';
    };
    if (closeWriteBtn) closeWriteBtn.addEventListener('click', closeWriteModal);
    if (cancelWriteBtn) cancelWriteBtn.addEventListener('click', closeWriteModal);
    if (writeModal) {
      writeModal.addEventListener('click', (e) => {
        if (e.target === writeModal) closeWriteModal();
      });
    }

    const submitWriteBtn = document.getElementById('submitWriteBtn');
    if (submitWriteBtn) {
      submitWriteBtn.addEventListener('click', async () => {
        const content = document.getElementById('postContent').value;
        const title = postTitleInput ? postTitleInput.value.trim() : '';
        if (!content.trim()) {
          alert('내용을 입력해주세요.');
          return;
        }
        if(!supabaseClient) {
          alert('DB 연결이 필요합니다.');
          return;
        }

        const isRetro = currentWriteType === 'retro';
        const board_type = isRetro ? 'retro' : 'free';
        const formattedContent = content.trim().replace(/\n/g, '<br>');
        const finalContent = title ? `<strong>${title}</strong><br>${formattedContent}` : formattedContent;
        
        let retro_tags = null;
        if(isRetro) {
          const checkedItems = document.querySelectorAll('.active-checkbox:checked');
          if(checkedItems.length > 0) {
            let tagsHtml = '';
            checkedItems.forEach(chk => {
               tagsHtml += `<span class="tag ${chk.dataset.color}">${chk.dataset.tag}</span> ${chk.dataset.text}<br>`;
            });
            retro_tags = `<div style="background:var(--bg-color); padding:10px; border-radius:8px; margin-bottom:12px; font-size:13px; color:var(--text-main); line-height:1.4;">${tagsHtml}</div>`;
          }
        }

        submitWriteBtn.disabled = true;
        submitWriteBtn.textContent = '등록하는 중...';

        const { error } = await supabaseClient.from('posts').insert([{
          board_type: board_type,
          author: getCurrentUserDisplayName(),
          author_id: getCurrentUserId(),
          author_role: getCurrentUserRole(),
          content: finalContent,
          retro_tags: retro_tags
        }]);

        submitWriteBtn.disabled = false;
        submitWriteBtn.textContent = '등록하기';

        if (error) {
          console.error(error);
          alert('게시글 등록 중 오류가 발생했습니다.');
          return;
        }

        if (isRetro) {
          alert('오늘의 소중한 회고가 등록되었습니다.');
          document.querySelector('.board-tab[data-board="board-free"]').click();
        } else {
          alert('자유/질문 글이 등록되었습니다.');
          document.querySelector('.board-tab[data-board="board-retro"]').click();
        }
        
        if (postTitleInput) postTitleInput.value = '';
        document.getElementById('postContent').value = '';
        closeWriteModal();

        // 작성 성공 시 최신 피드 갱신
        if(typeof fetchPosts === 'function') fetchPosts();
      });
    }

    const getDateKeyInSeoul = (dateValue) => {
      const date = new Date(dateValue);
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(date);
    };

    const getLongestConsecutiveStreak = (dateKeys = []) => {
      if (!dateKeys.length) return 0;
      const sortedDates = [...new Set(dateKeys)].sort();
      let maxStreak = 1;
      let currentStreak = 1;

      for (let i = 1; i < sortedDates.length; i += 1) {
        const previous = new Date(`${sortedDates[i - 1]}T00:00:00+09:00`);
        const current = new Date(`${sortedDates[i]}T00:00:00+09:00`);
        const dayDiff = Math.round((current - previous) / 86400000);

        if (dayDiff === 1) {
          currentStreak += 1;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }

      return maxStreak;
    };

    const POSTS_PER_PAGE = 4;
    const boardPageState = {
      'board-free': 1,
      'board-expert': 1,
      'board-retro': 1
    };

    const getBoardEntryFromCard = (card) => {
      const author = card.querySelector('.author-name')?.textContent || '';
      const contentText = card.querySelector('.feed-content')?.innerText.replace(/\s+/g, ' ').trim() || '';
      const time = card.querySelector('.feed-time')?.textContent || '';
      const postId = card.getAttribute('data-post-id') || `mock-${Math.random().toString(36).slice(2, 10)}`;
      const hasExpertReply = [...card.querySelectorAll('.comment-author')].some(node => node.textContent.includes('전문가'));
      const effectiveAuthorId = resolveLegacyAuthorId(author);

      return {
        postId,
        author,
        effectiveAuthorId,
        contentText,
        time,
        hasExpertReply,
        html: card.outerHTML
      };
    };

    const renderCouponGrid = (coupons = []) => {
      const couponGrid = document.getElementById('couponGrid');
      if (!couponGrid) return;

      if (!coupons.length) {
        couponGrid.innerHTML = `
          <div class="coupon-card empty"><span>받은 쿠폰이 없습니다</span></div>
          <div class="coupon-card empty"><span>비어있음</span></div>
          <div class="coupon-card empty"><span>비어있음</span></div>
          <div class="coupon-card empty"><span>비어있음</span></div>
        `;
        return;
      }

      const couponCards = coupons.map((coupon) => {
        const title = coupon.title || '쿠폰';
        const imageUrl = coupon.publicImageUrl || '';
        const status = coupon.status || 'issued';
        const statusLabel = status === 'used' ? '사용 완료' : status === 'expired' ? '만료됨' : '보관중';

        if (imageUrl) {
          return `
            <div class="coupon-card" data-coupon-status="${status}">
              <img src="${imageUrl}" alt="${title}" data-coupon-image="true" data-coupon-title="${title}">
              <div class="coupon-info">${title}</div>
            </div>
          `;
        }

        return `
          <div class="coupon-card empty" data-coupon-status="${status}">
            <span>${title} · ${statusLabel}</span>
          </div>
        `;
      });

      while (couponCards.length < 4) {
        couponCards.push('<div class="coupon-card empty"><span>비어있음</span></div>');
      }

      couponGrid.innerHTML = couponCards.join('');
    };

    const normalizeCouponStoragePath = (path = '', bucket = 'coupon-images') => {
      const rawPath = String(path || '').trim();
      if (!rawPath) return '';

      if (/^https?:\/\//i.test(rawPath)) {
        return rawPath;
      }

      let normalizedPath = rawPath.replace(/^\/+/, '');

      if (normalizedPath.startsWith(`${bucket}/`)) {
        normalizedPath = normalizedPath.slice(bucket.length + 1);
      }

      return normalizedPath;
    };

    const getCouponPublicImageUrl = (coupon = {}) => {
      const bucket = coupon.storage_bucket || 'coupon-images';
      const normalizedPath = normalizeCouponStoragePath(coupon.storage_path, bucket);
      if (!supabaseClient || !normalizedPath) return '';
      if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
      const { data } = supabaseClient.storage.from(bucket).getPublicUrl(normalizedPath);
      return data?.publicUrl || '';
    };

    const fetchUserCoupons = async () => {
      if (!supabaseClient || !getCurrentUserId()) {
        renderCouponGrid([]);
        return;
      }

      const { data, error } = await supabaseClient
        .from('user_coupons')
        .select('id, user_id, title, coupon_type, storage_bucket, storage_path, status, issued_at, expires_at')
        .eq('user_id', getCurrentUserId())
        .order('issued_at', { ascending: false });

      if (error) {
        console.error('쿠폰 불러오기 실패:', error);
        renderCouponGrid([]);
        return;
      }

      const normalizedCoupons = (data || []).map((coupon) => ({
        ...coupon,
        publicImageUrl: getCouponPublicImageUrl(coupon)
      }));

      renderCouponGrid(normalizedCoupons);
    };

    const refreshUserScopedUi = () => {
      renderRewardDashboard();
      updateTrustDashboardCounts();
      if (typeof renderTrustActivityList === 'function') renderTrustActivityList();
      fetchUserCoupons();
    };

    const renderBoardPagination = (boardId, totalPages) => {
      const pagination = document.querySelector(`[data-board-pagination="${boardId}"]`);
      if (!pagination) return;

      if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
      }

      const currentPage = boardPageState[boardId] || 1;
      const pageButtons = Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        return `<button type="button" class="page-btn ${page === currentPage ? 'active' : ''}" data-page-target="${boardId}" data-page-number="${page}">${page}</button>`;
      }).join('');

      pagination.innerHTML = `
        <button type="button" class="page-btn" data-page-target="${boardId}" data-page-number="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>\uC774\uC804</button>
        ${pageButtons}
        <button type="button" class="page-btn" data-page-target="${boardId}" data-page-number="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>\uB2E4\uC74C</button>
      `;

      pagination.querySelectorAll('[data-page-number]').forEach(button => {
        button.addEventListener('click', () => {
          const nextPage = Number(button.getAttribute('data-page-number'));
          if (!nextPage || nextPage === currentPage) return;
          boardPageState[boardId] = nextPage;
          renderBoardPane(boardId);
        });
      });
    };

    function renderBoardPane(boardId) {
      const pane = document.getElementById(boardId);
      const feedList = pane?.querySelector('.feed-list');
      const allEntries = window.boardEntries?.[boardId] || [];
      if (!pane || !feedList) return;

      const totalPages = Math.max(1, Math.ceil(allEntries.length / POSTS_PER_PAGE));
      boardPageState[boardId] = Math.min(Math.max(boardPageState[boardId] || 1, 1), totalPages);

      const startIndex = (boardPageState[boardId] - 1) * POSTS_PER_PAGE;
      const currentEntries = allEntries.slice(startIndex, startIndex + POSTS_PER_PAGE);

      feedList.innerHTML = currentEntries.length
        ? currentEntries.map(entry => entry.html).join('')
        : '<div class="feed-card"><div class="feed-content">아직 등록된 게시글이 없습니다.</div></div>';

      feedList.querySelectorAll('.feed-card').forEach(attachFeedCardEvents);
      feedList.querySelectorAll('.comment-input').forEach(input => {
        input.placeholder = '\uC9C8\uBB38\uC774\uB098 \uC758\uACAC\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694';
      });

      renderBoardPagination(boardId, totalPages);
    }

    function renderRewardDashboard() {
      const postsData = window.latestPostsData || [];
      const myPosts = postsData.filter(post => isCurrentUsersAuthor(post));
      const statusRecordPosts = myPosts.filter(post => post.board_type === 'retro');

      const daysByBoard = {
        retro: [],
        expert: [],
        free: []
      };

      myPosts.forEach(post => {
        const boardKey = post.board_type === 'retro' || post.board_type === 'expert' ? post.board_type : 'free';
        if (post.created_at) daysByBoard[boardKey].push(getDateKeyInSeoul(post.created_at));
      });

      const maxConsecutiveDays = Math.max(
        getLongestConsecutiveStreak(daysByBoard.retro),
        getLongestConsecutiveStreak(daysByBoard.expert),
        getLongestConsecutiveStreak(daysByBoard.free)
      );

      const maxBoardDays = Math.max(
        new Set(daysByBoard.retro).size,
        new Set(daysByBoard.expert).size,
        new Set(daysByBoard.free).size
      );

      const rewardStatusFirstPost = document.getElementById('rewardStatusFirstPost');
      const rewardStatusThreeDays = document.getElementById('rewardStatusThreeDays');
      const rewardStatusBestOwner = document.getElementById('rewardStatusBestOwner');
      const rewardStatusOperatorEvent = document.getElementById('rewardStatusOperatorEvent');

      if (rewardStatusFirstPost) {
        rewardStatusFirstPost.textContent = statusRecordPosts.length >= 1 ? '달성 완료' : `${statusRecordPosts.length}/1 진행중`;
        rewardStatusFirstPost.classList.toggle('complete', statusRecordPosts.length >= 1);
      }

      if (rewardStatusThreeDays) {
        rewardStatusThreeDays.textContent = maxConsecutiveDays >= 3 ? '달성 완료' : `${maxConsecutiveDays}/3 연속`;
        rewardStatusThreeDays.classList.toggle('complete', maxConsecutiveDays >= 3);
      }

      if (rewardStatusBestOwner) {
        rewardStatusBestOwner.textContent = maxBoardDays >= 10 ? '선정 기준 달성' : `${maxBoardDays}/10 진행중`;
        rewardStatusBestOwner.classList.toggle('complete', maxBoardDays >= 10);
      }

      if (rewardStatusOperatorEvent) {
        rewardStatusOperatorEvent.textContent = '이벤트 안내 예정';
        rewardStatusOperatorEvent.classList.remove('complete');
      }
    }

    // --- DB에서 포스트 & 댓글 불러와서 렌더링 ---
    window.fetchPosts = async () => {
      if(!supabaseClient) return;

      const { data: postsData, error: postsError } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error("게시글 불러오기 실패:", postsError);
        return;
      }

      const { data: commentsData, error: commentsError } = await supabaseClient
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error("댓글 불러오기 실패:", commentsError);
        return;
      }

      const normalizedPostsData = (postsData || []).map(post => ({
        ...post,
        effectiveAuthorId: getEffectiveAuthorId(post),
        effectiveAuthorRole: getEffectiveAuthorRole(post)
      }));
      const normalizedCommentsData = (commentsData || []).map(comment => ({
        ...comment,
        effectiveAuthorId: getEffectiveAuthorId(comment),
        effectiveAuthorRole: getEffectiveAuthorRole(comment)
      }));

      window.latestPostsData = normalizedPostsData;
      window.latestCommentsData = normalizedCommentsData;

      // 게시판 컨테이너
      const boardOperation = document.querySelector('#board-free .feed-list');
      const boardExpert = document.querySelector('#board-expert .feed-list');
      const boardFree = document.querySelector('#board-retro .feed-list');
      
      // 목업 더미 카드는 남겨두기 위해 기존 innerHTML 백업 (또는 렌더 전 목업 찾기)
      // 초기에만 백업하고 관리하도록 설계
      if (!window.mockBoardEntries) {
        window.mockBoardEntries = {
          'board-free': boardOperation ? [...boardOperation.querySelectorAll('.feed-card')].map(getBoardEntryFromCard) : [],
          'board-expert': boardExpert ? [...boardExpert.querySelectorAll('.feed-card')].map(getBoardEntryFromCard) : [],
          'board-retro': boardFree ? [...boardFree.querySelectorAll('.feed-card')].map(getBoardEntryFromCard) : []
        };
      }

      let operationEntries = [];
      let expertEntries = [];
      let freeEntries = [];

      normalizedPostsData.forEach(post => {
        const postComments = normalizedCommentsData.filter(c => c.post_id === post.id);
        let commentsHtml = postComments.map(c => `
          <div class="comment-item">
            <span class="comment-author">${getAuthorDisplayHtml(c.author, c.effectiveAuthorRole)}</span> ${c.content}
          </div>
        `).join('');
        
        if (commentsHtml === '') {
          commentsHtml = '<div class="empty-comment">첫 댓글을 남겨보세요.</div>';
        }

        const tagsHtml = post.retro_tags ? post.retro_tags : '';
        const timeStr = new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const contentText = `${tagsHtml ? tagsHtml.replace(/<[^>]+>/g, ' ') : ''} ${post.content.replace(/<[^>]+>/g, ' ')}`.replace(/\s+/g, ' ').trim();
        const hasExpertReply = postComments.some(comment => isExpertAuthor(comment.author || '', comment.effectiveAuthorRole));

        const cardHtml = `
          <div class="feed-card" data-post-id="${post.id}">
            <div class="feed-header">
              <div class="feed-author">
                <div class="author-avatar ${getAuthorAvatarClass(post.author, post.effectiveAuthorRole)}">${post.author.charAt(0)}</div>
                <span class="author-name">${post.author}</span>
                <span class="feed-time">${timeStr}</span>
              </div>
            </div>
            <div class="feed-content">
              ${tagsHtml}
              ${post.content}
            </div>
            <div class="feed-actions">
              <button class="action-btn btn-like"><span class="icon"><i class="ri-heart-3-line" aria-hidden="true"></i></span> <span class="count">0</span></button>
              <button class="action-btn btn-comment"><span class="icon"><i class="ri-chat-3-line" aria-hidden="true"></i></span> <span class="count">${postComments.length}</span></button>
            </div>
            <div class="feed-comments" style="display: none;">
              <div class="comment-list">${commentsHtml}</div>
              <div class="comment-input-area">
                <textarea class="comment-input" rows="1" placeholder="따뜻한 한마디를 입력해주세요"></textarea>
                <button class="btn btn-primary submit-comment">등록</button>
              </div>
            </div>
          </div>
        `;

        const entry = {
          postId: String(post.id),
          author: post.author,
          effectiveAuthorId: post.effectiveAuthorId,
          contentText,
          time: timeStr,
          hasExpertReply,
          html: cardHtml
        };

        if (post.board_type === 'retro') {
          operationEntries.push(entry);
        } else if (post.board_type === 'expert') {
          expertEntries.push(entry);
        } else {
          freeEntries.push(entry);
        }
      });

      // DB 렌더링 뒤에 더미를 붙이기

      window.boardEntries = {
        'board-free': [...operationEntries, ...(window.mockBoardEntries['board-free'] || [])],
        'board-expert': [...expertEntries, ...(window.mockBoardEntries['board-expert'] || [])],
        'board-retro': [...freeEntries, ...(window.mockBoardEntries['board-retro'] || [])]
      };

      renderBoardPane('board-free');
      renderBoardPane('board-expert');
      renderBoardPane('board-retro');
      updateTrustDashboardCounts();
      renderRewardDashboard();
      fetchUserCoupons();
      if (typeof renderTrustActivityList === 'function') renderTrustActivityList();
    };

    renderRewardDashboard();
    renderCouponGrid([]);

    // 로드 시 포스트 한번 불러오기
    fetchPosts();

    // --- 실전 템플릿 서브페이지 로직 ---
    const btnTemplate = document.getElementById('btnTemplate');
    const templatePage = document.getElementById('templatePage');
    const closeTemplateBtn = document.getElementById('closeTemplateBtn');
    const btnTemplateStartRecord = document.getElementById('btnTemplateStartRecord');
    const btnOpenCommunityIntro = document.getElementById('btnOpenCommunityIntro');
    const communityIntroPage = document.getElementById('communityIntroPage');
    const closeCommunityIntroBtn = document.getElementById('closeCommunityIntroBtn');
    const btnIntroStart = document.getElementById('btnIntroStart');

    const hydrateTemplateGuideCopy = () => {
      const setText = (selector, value, root = document) => {
        const el = root.querySelector(selector);
        if (el) el.textContent = value;
      };
      const setHtml = (selector, value, root = document) => {
        const el = root.querySelector(selector);
        if (el) el.innerHTML = value;
      };
      const setAttr = (selector, attr, value, root = document) => {
        const el = root.querySelector(selector);
        if (el) el.setAttribute(attr, value);
      };

      const t = {
        templateGuideLink: "\uC2E4\uC804 \uD15C\uD50C\uB9BF \uAC00\uC774\uB4DC",
        insight: [
          {
            kicker: "템플릿",
            title: "\uC2E4\uC804 \uD15C\uD50C\uB9BF",
            desc: "\uC591\uB3C4 \uAE00\uC5D0 \uBC14\uB85C \uC4F8 \uD575\uC2EC \uD56D\uBAA9\uACFC \uC608\uC2DC \uBB38\uC7A5\uC744 \uD55C \uBC88\uC5D0 \uC815\uB9AC\uD55C \uBB38\uC11C\uC785\uB2C8\uB2E4.",
            cta: "\uD15C\uD50C\uB9BF \uC2DC\uD2B8 \uBCF4\uAE30"
          },
          {
            kicker: "\uCE7C\uB7FC",
            title: "\uAE30\uB85D\uC73C\uB85C \uC900\uBE44\uD558\uAE30",
            desc: "\uC591\uC218\uC790\uAC00 \uBB34\uC5C7\uC744 \uBCF4\uACE0 \uD310\uB2E8\uD558\uB294\uC9C0\uBD80\uD130, \uC5B4\uB5A4 \uAE30\uB85D\uC774 \uADFC\uAC70\uAC00 \uB418\uB294\uC9C0 \uC77D\uB294 \uD398\uC774\uC9C0\uC785\uB2C8\uB2E4.",
            cta: "\uCE7C\uB7FC \uC77D\uAE30"
          }
        ],
        hero: {
          header: "\uC2E4\uC804 \uD15C\uD50C\uB9BF",
          chip: "\uC591\uB3C4\uC790 \uC804\uC6A9 \uC2E4\uC804 \uD15C\uD50C\uB9BF",
          title: "\uC2E4\uC804 \uB9E4\uBB3C \uC18C\uAC1C \uD398\uC774\uC9C0 \uC791\uC131\uD558\uAE30",
          desc: "\uC88B\uC740 \uB9E4\uBB3C \uAE00\uC740 \uC798 \uC4F0\uB294 \uAC83\uC774 \uC544\uB2C8\uB77C, \uC774\uBBF8 \uC815\uB9AC\uB41C \uC6B4\uC601\uC5D0\uC11C \uB098\uC635\uB2C8\uB2E4.",
          note: "\uB9E4\uBB3C \uAE00\uC774 \uB9C9\uB9C9\uD55C \uC774\uC720\uB294 \uAE00\uC744 \uBABB \uC368\uC11C\uAC00 \uC544\uB2C8\uB77C \uC6B4\uC601\uC774 \uC815\uB9AC\uB418\uC5B4 \uC788\uC9C0 \uC54A\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4."
        },
        example: {
          chip: "\uC644\uC131 \uC608\uC2DC",
          title: "\uC774\uB807\uAC8C \uC815\uB9AC\uB41C \uB9E4\uC7A5\uC740 \uC124\uBA85\uC774 \uB429\uB2C8\uB2E4",
          desc: "\uC2E4\uC81C \uC608\uC2DC\uB97C \uBA3C\uC800 \uBCF4\uACE0, \uAC19\uC740 \uC21C\uC11C\uB85C \uC6CC\uD06C\uC2DC\uD2B8\uB97C \uCCB4\uD06C\uD574\uBCF4\uC138\uC694.",
          toggleClosed: "\uC5F4\uC5B4\uBCF4\uAE30",
          toggleOpen: "\uB2EB\uAE30",
          quote: "\u201C\uC774 \uB9E4\uC7A5\uC740 \uC778\uADFC \uC624\uD53C\uC2A4 \uC0C1\uAD8C\uC758 \uC810\uC2EC \uC218\uC694\uB97C \uAE30\uBC18\uC73C\uB85C, \uC810\uC2EC \uB2E8\uACE8\uACFC \uBC30\uB2EC \uC2E0\uADDC \uC720\uC785\uC774 \uBC18\uBCF5\uB418\uB294 \uAD6C\uC870\uB97C \uAC16\uACE0 \uC788\uC2B5\uB2C8\uB2E4.\u201D",
          closing: "\u201C\uB9E4\uCD9C\uC774 \uC544\uB2C8\uB77C \uC774 \uB9E4\uC7A5\uC774 \uC5B4\uB5BB\uAC8C \uB3CC\uC544\uAC00\uB294\uC9C0\uAC00 \uBCF4\uC785\uB2C8\uB2E4.\u201D",
          sections: [
            {
              title: "1. \uB9E4\uCD9C \uAD6C\uC870",
              items: [
                { label: "\uC6D4 \uB9E4\uCD9C", value: "\uC57D 3,200\uB9CC\uC6D0" },
                { label: "\uC6D4 \uC21C\uC218\uC775", value: "\uC57D 900\uB9CC\uC6D0" },
                { label: "\uC131\uC218\uAE30 / \uBE44\uC218\uAE30", value: "\uC5EC\uB984 (\uBC30\uB2EC \uC99D\uAC00), \uACA8\uC6B8 (\uD640 \uBE44\uC911 \uC99D\uAC00)" },
                { label: "\uB9E4\uCD9C\uC774 \uC624\uB974\uB294 \uC2DC\uC810", value: "\uD3C9\uC77C \uC810\uC2EC / \uAE08\uC694\uC77C \uC800\uB141" },
                { label: "\uB9E4\uCD9C\uC774 \uB5A8\uC5B4\uC9C0\uB294 \uC2DC\uC810", value: "\uC6D4\uC694\uC77C \uC800\uB141, \uBE44 \uC624\uB294 \uB0A0" }
              ]
            },
            {
              title: "2. \uACE0\uAC1D \uAD6C\uC870",
              items: [
                { label: "\uB2E8\uACE8 \uBE44\uC911", value: "\uC57D 60%" },
                { label: "\uC2E0\uADDC \uACE0\uAC1D \uC720\uC785 \uACBD\uB85C", value: "\uBC30\uB2EC\uC571 (70%), \uB124\uC774\uBC84 \uAC80\uC0C9 (30%)" },
                { label: "\uC8FC\uC694 \uACE0\uAC1D \uC5F0\uB839\uB300", value: "30~40\uB300 \uC9C1\uC7A5\uC778" },
                { label: "\uACE0\uAC1D\uC774 \uC790\uC8FC \uCC3E\uB294 \uC774\uC720", value: "\uBE60\uB978 \uC870\uB9AC, \uC810\uC2EC \uD68C\uC804\uC728, \uC77C\uC815\uD55C \uB9DB", quoted: true },
                { label: "\uACE0\uAC1D\uC774 \uC774\uD0C8\uD558\uB294 \uC774\uC720", value: "\uB300\uAE30\uC2DC\uAC04 \uAE38\uC5B4\uC9C8 \uB54C", quoted: true }
              ]
            },
            {
              title: "3. \uC6B4\uC601 \uAD6C\uC870",
              items: [
                { label: "\uC9C1\uC6D0 \uAD6C\uC131", value: "\uC8FC\uBC29 1\uBA85, \uD640 / \uD3EC\uC7A5 1\uBA85" },
                { label: "\uADFC\uBB34 \uBC29\uC2DD", value: "\uC810\uC2EC \uC9D1\uC911 \uC6B4\uC601 / \uC800\uB141 \uCD95\uC18C \uC6B4\uC601" },
                { label: "\uC0AC\uC7A5 \uAC1C\uC785\uB3C4", value: "\uC810\uC2EC \uD53C\uD06C\uB9CC \uC9C1\uC811 \uCC38\uC5EC" },
                { label: "\uC6B4\uC601 \uB09C\uC774\uB3C4", value: "\uB808\uC2DC\uD53C \uB2E8\uC21C / 1\uC8FC\uC77C \uB0B4 \uAD50\uC721 \uAC00\uB2A5" },
                { label: "\uC778\uC218 \uD6C4 \uBC14\uB85C \uC6B4\uC601 \uAC00\uB2A5 \uC5EC\uBD80", value: "\uAC00\uB2A5 (\uAE30\uC874 \uC9C1\uC6D0 \uC720\uC9C0 \uC2DC \uC548\uC815\uC801)" }
              ]
            },
            {
              title: "4. \uB9E4\uCD9C \uBC1C\uC0DD \uAD6C\uC870",
              items: [
                { label: "\uC774 \uB9E4\uCD9C\uC774 \uB098\uC624\uB294 \uAC00\uC7A5 \uD070 \uC774\uC720", value: "\uC778\uADFC \uC624\uD53C\uC2A4 \uC0C1\uAD8C \uC810\uC2EC \uC218\uC694 \uC9D1\uC911" },
                { label: "\uB9E4\uCD9C\uC774 \uC720\uC9C0\uB418\uB294 \uAD6C\uC870", value: "\uC810\uC2EC \uB2E8\uACE8 + \uBC30\uB2EC \uC2E0\uADDC \uC720\uC785 \uBC18\uBCF5 \uAD6C\uC870", quoted: true },
                { label: "\uC774 \uAD6C\uC870\uAC00 \uAE68\uC9C8 \uC218 \uC788\uB294 \uB9AC\uC2A4\uD06C", value: "\uC778\uADFC \uAC74\uBB3C \uACF5\uC2E4 \uC99D\uAC00 \uC2DC \uC810\uC2EC \uC218\uC694 \uAC10\uC18C" }
              ]
            },
            {
              title: "5. \uC591\uC218\uC790 \uAD00\uC810",
              items: [
                { label: "\uC778\uC218 \uD6C4 \uADF8\uB300\uB85C \uC720\uC9C0 \uAC00\uB2A5\uD55C \uC694\uC18C", value: "\uC810\uC2EC \uC911\uC2EC \uC6B4\uC601 \uAD6C\uC870" },
                { label: "\uBC18\uB4DC\uC2DC \uC774\uC5B4\uBC1B\uC544\uC57C \uD558\uB294 \uC6B4\uC601 \uBC29\uC2DD", value: "\uBE60\uB978 \uD68C\uC804 / \uBA54\uB274 \uB2E8\uC21C\uD654", quoted: true },
                { label: "\uAC1C\uC120\uD558\uBA74 \uB354 \uC88B\uC544\uC9C8 \uBD80\uBD84", value: "\uBC30\uB2EC \uBA54\uB274 \uD655\uC7A5 / \uC800\uB141 \uB9E4\uCD9C \uBCF4\uC644", quoted: true }
              ]
            }
          ]
        },
        template: {
          chip: "\uC2E4\uC81C \uD15C\uD50C\uB9BF",
          title: "\uC774 \uAD6C\uC870\uB85C \uB9E4\uBB3C\uC744 \uC815\uB9AC\uD574\uBCF4\uC138\uC694",
          desc: "\uC785\uB825 \uB300\uC2E0 \uCCB4\uD06C\uD558\uBA74\uC11C, \uC5B4\uB5A4 \uD56D\uBAA9\uC774 \uC900\uBE44\uB418\uC5B4 \uC788\uB294\uC9C0 \uC6CC\uD06C\uC2DC\uD2B8\uCC98\uB7FC \uC810\uAC80\uD560 \uC218 \uC788\uAC8C \uAD6C\uC131\uD588\uC2B5\uB2C8\uB2E4.",
          checkCaption: "\uC900\uBE44 \uCCB4\uD06C",
          sections: [
            {
              title: "1. \uB9E4\uCD9C \uAD6C\uC870",
              desc: "\uB9E4\uCD9C \uD06C\uAE30\uB9CC \uB9D0\uD558\uC9C0 \uB9D0\uACE0 \uD750\uB984\uACFC \uBCC0\uB3D9 \uC774\uC720\uAE4C\uC9C0 \uBCF4\uC774\uAC8C \uC815\uB9AC\uD569\uB2C8\uB2E4.",
              fields: ["\uC6D4 \uB9E4\uCD9C", "\uC6D4 \uC21C\uC218\uC775", "\uC131\uC218\uAE30 / \uBE44\uC218\uAE30", "\uB9E4\uCD9C\uC774 \uC624\uB974\uB294 \uC2DC\uC810", "\uB9E4\uCD9C\uC774 \uB5A8\uC5B4\uC9C0\uB294 \uC2DC\uC810"]
            },
            {
              title: "2. \uACE0\uAC1D \uAD6C\uC870",
              desc: "\uACE0\uAC1D\uC774 \uB204\uAD6C\uACE0 \uC65C \uC624\uB294\uC9C0\uAC00 \uBCF4\uC5EC\uC57C \uC591\uC218\uC790\uB3C4 \uADFC\uAC70\uB97C \uC774\uD574\uD569\uB2C8\uB2E4.",
              fields: ["\uB2E8\uACE8 \uBE44\uC911", "\uC2E0\uADDC \uACE0\uAC1D \uC720\uC785 \uACBD\uB85C", "\uC8FC\uC694 \uACE0\uAC1D \uC5F0\uB839\uB300", "\uACE0\uAC1D\uC774 \uC790\uC8FC \uCC3E\uB294 \uC774\uC720", "\uACE0\uAC1D\uC774 \uC774\uD0C8\uD558\uB294 \uC774\uC720"]
            },
            {
              title: "3. \uC6B4\uC601 \uAD6C\uC870",
              desc: "\uB0B4\uAC00 \uBE60\uC9C0\uBA74 \uB9E4\uC7A5\uC774 \uC5B4\uB5BB\uAC8C \uB3CC\uC544\uAC00\uB294\uC9C0 \uBCF4\uC5EC\uC8FC\uB294 \uC601\uC5ED\uC785\uB2C8\uB2E4.",
              fields: ["\uC9C1\uC6D0 \uAD6C\uC131", "\uADFC\uBB34 \uBC29\uC2DD", "\uC0AC\uC7A5 \uAC1C\uC785\uB3C4", "\uC6B4\uC601 \uB09C\uC774\uB3C4", "\uC778\uC218 \uD6C4 \uBC14\uB85C \uC6B4\uC601 \uAC00\uB2A5 \uC5EC\uBD80"]
            },
            {
              title: "4. \uB9E4\uCD9C \uBC1C\uC0DD \uAD6C\uC870",
              desc: "\uC22B\uC790 \uB4A4\uC5D0 \uC788\uB294 \uC0C1\uAD8C, \uACE0\uAC1D, \uC6B4\uC601 \uBC18\uBCF5 \uAD6C\uC870\uB97C \uC815\uB9AC\uD569\uB2C8\uB2E4.",
              fields: ["\uC774 \uB9E4\uCD9C\uC774 \uB098\uC624\uB294 \uAC00\uC7A5 \uD070 \uC774\uC720", "\uB9E4\uCD9C\uC774 \uC720\uC9C0\uB418\uB294 \uAD6C\uC870", "\uC774 \uAD6C\uC870\uAC00 \uAE68\uC9C8 \uC218 \uC788\uB294 \uB9AC\uC2A4\uD06C"]
            },
            {
              title: "5. \uC591\uC218\uC790 \uAD00\uC810",
              desc: "\uC591\uC218\uC790\uAC00 \uADF8\uB300\uB85C \uC774\uC5B4\uBC1B\uC744 \uAC83\uACFC \uAC1C\uC120\uD560 \uAC83\uC744 \uAD6C\uBD84\uD574 \uBCF4\uC5EC\uC8FC\uB294 \uAD6C\uAC04\uC785\uB2C8\uB2E4.",
              fields: ["\uC778\uC218 \uD6C4 \uADF8\uB300\uB85C \uC720\uC9C0 \uAC00\uB2A5\uD55C \uC694\uC18C", "\uBC18\uB4DC\uC2DC \uC774\uC5B4\uBC1B\uC544\uC57C \uD558\uB294 \uC6B4\uC601 \uBC29\uC2DD", "\uAC1C\uC120\uD558\uBA74 \uB354 \uC88B\uC544\uC9C8 \uBD80\uBD84"]
            }
          ]
        },
        cta: {
          note: "\uCCB4\uD06C\uAC00 \uC548 \uB418\uB294 \uD56D\uBAA9\uBD80\uD130 \uCEE4\uBBA4\uB2C8\uD2F0 \uAE30\uB85D\uC73C\uB85C \uCC44\uC6CC\uBCF4\uC138\uC694.",
          button: "\uCEE4\uBBA4\uB2C8\uD2F0\uC5D0\uC11C \uAE30\uB85D \uC2DC\uC791\uD558\uAE30"
        }
      };

      setText('.home-hero-sub', '\uC591\uB3C4\uC790\uB4E4\uB9CC\uC758 \uD504\uB77C\uC774\uBE57 \uCEE4\uBBA4\uB2C8\uD2F0');
      setHtml('.home-hero-title', '<span class="sub-text home-hero-sub">\uC591\uB3C4\uC790\uB4E4\uB9CC\uC758 \uD504\uB77C\uC774\uBE57 \uCEE4\uBBA4\uB2C8\uD2F0</span><br>\uD568\uAED8 \uBAA8\uC5EC \uC6D0\uD558\uB294 \uAD8C\uB9AC\uAE08 \uBC1B\uACE0<br>\uAC00\uAC8C\uB97C \uD314\uC544\uBCF4\uC138\uC694!');
      const homeBadges = document.querySelectorAll('.hero-section .badge');
      if (homeBadges[0]) homeBadges[0].innerHTML = '<span class="emoji">\uD83E\uDD2B</span> \uC591\uB3C4 \uC0AC\uC7A5\uB2D8 \uC804\uC6A9';
      if (homeBadges[1]) homeBadges[1].innerHTML = '<span class="emoji">\uD83D\uDEE1\uFE0F</span> \uAD8C\uB9AC\uAE08 \uBC29\uC5B4 \uD504\uB85C\uC81D\uD2B8';
      if (homeBadges[2]) homeBadges[2].innerHTML = '<span class="emoji">\uD83D\uDC68\u200D\uD83D\uDCBC</span> \uD504\uB79C\uCC28\uC774\uC988 \uC804\uBB38\uAC00 \uC9C1\uC811 \uC9C0\uC6D0';
      setHtml('.home-problem-title', '\uB9E4\uC7A5 \uD310\uB9E4\uAE4C\uC9C0 \uD3C9\uADE0 1\uB144.<br>\uC0AC\uC7A5\uB2D8\uC758 \uAD8C\uB9AC\uAE08\uC740 \uC548\uB155\uD558\uC2E0\uAC00\uC694?');
      setHtml('.home-problem-desc', '\uB300\uBD80\uBD84\uC758 \uC591\uB3C4\uC790\uAC00 \uCD08\uAE30 \uBAA9\uD45C\uD588\uB358 \uAD8C\uB9AC\uAE08\uC744 \uC9C0\uD0A4\uC9C0 \uBABB\uD569\uB2C8\uB2E4. \uB9E4\uAC01 \uAE30\uAC04\uC774 \uAE38\uC5B4\uC9C8\uC218\uB85D <strong>"\uC774\uC81C \uB0B4 \uB9E4\uC7A5\uC774 \uC544\uB2C8\uB2E4"</strong>\uB77C\uB294 \uC0DD\uAC01\uC5D0 \uAD00\uB9AC\uAC00 \uC18C\uD640\uD574\uC9C0\uACE0, \uC774\uB294 \uB9E4\uCD9C \uD558\uB77D\uACFC \uC6B4\uC601 \uC0C1\uD0DC \uC545\uD654\uB85C \uC774\uC5B4\uC9D1\uB2C8\uB2E4.');
      setHtml('.home-problem-solution', '\uB098\uD640\uB85C \uC9C0\uCE58\uC9C0 \uC54A\uAC8C, \uC591\uB3C4\uC790 \uCEE4\uBBA4\uB2C8\uD2F0\uC5D0\uC11C \uD568\uAED8 \uC73C\uC330\uC73C\uC330\uD558\uBA70 <span class="inline-primary-strong">\uB05D\uAE4C\uC9C0 \uB9E4\uC7A5\uC744 \uCD5C\uC0C1\uC758 \uC0C1\uD0DC\uB85C \uC720\uC9C0\uD558\uC138\uC694!</span>');
      setText('.home-benefits-title', "\uCEE4\uBBA4\uB2C8\uD2F0 '\uD568\uAED8\uD574\uC694' \uAC00\uC785 \uD61C\uD0DD");
      const benefitItems = document.querySelectorAll('.benefits-list .benefit-item');
      const benefitCopy = [
        ['\uC804\uBB38\uAC00 \uBC00\uCC29 \uC9C0\uC6D0', '\uD504\uB79C\uCC28\uC774\uC988 \uAD00\uB9AC \uACBD\uD5D8\uC790\uB4E4\uC758 1:1 \uB178\uD558\uC6B0 \uBC0F \uD53C\uB4DC\uBC31 \uC81C\uACF5'],
        ['\uB3D9\uAE30\uBD80\uC5EC \uBC0F \uC0C1\uD0DC \uCCB4\uD06C', '\uC758\uC9C0 \uD558\uB77D \uBC29\uC9C0\uB97C \uC704\uD55C \uC8FC\uAE30\uC801 \uD65C\uB3D9 \uBC0F \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \uBBF8\uC158 \uC218\uD589'],
        ['\uC2E4\uC804 \uD15C\uD50C\uB9BF \uC81C\uACF5', '\uC591\uB3C4 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \uB4F1 \uAC70\uB798\uC5D0 \uAF2D \uD544\uC694\uD55C \uD544\uC218 \uBB38\uC11C \uD15C\uD50C\uB9BF \uBB34\uB8CC \uC81C\uACF5'],
        ['\uD65C\uB3D9 \uB9AC\uC6CC\uB4DC \uC218\uC775', '\uCEE4\uBBA4\uB2C8\uD2F0 \uD65C\uB3D9 \uBC0F \uBBF8\uC158 \uB2EC\uC131 \uC2DC \uB9E4\uC8FC \uC77C\uC815 \uAE08\uC561\uC758 \uB9AC\uC6CC\uB4DC \uC9C0\uAE09'],
        ['\uD2B9\uBCC4 \uD61C\uD0DD', '\uC778\uC99D \uB9E4\uC7A5 \uB4F1\uB85D \uBE44\uC6A9(10\uB9CC \uC6D0) \uC804\uC561 \uBA74\uC81C']
      ];
      benefitItems.forEach((item, index) => {
        const title = item.querySelector('h4');
        const desc = item.querySelector('p');
        if (title && benefitCopy[index]) title.textContent = benefitCopy[index][0];
        if (desc && benefitCopy[index]) desc.textContent = benefitCopy[index][1];
      });
      if (benefitItems[4]) {
        setHtml('p', '\uC778\uC99D \uB9E4\uC7A5 \uB4F1\uB85D \uBE44\uC6A9(10\uB9CC \uC6D0) <strong>\uC804\uC561 \uBA74\uC81C</strong>', benefitItems[4]);
      }
      setHtml('.home-cta-title', '\uC0C8\uB85C\uC6B4 \uCD9C\uBC1C\uC744 \uC704\uD55C \uC5EC\uC815\uC5D0 \uD544\uC694\uD55C \uBAA8\uB4E0 \uAC83\uC744<br>\uB0B4\uC77C\uC0AC\uC7A5\uACFC \uD568\uAED8\uD574\uC694!');
      setText('#homeApplyBtn', '\uC2E0\uCCAD\uD558\uAE30');
      setAttr('#scrollToTopBtn', 'aria-label', '\uCD5C\uC0C1\uB2E8\uC73C\uB85C \uC774\uB3D9');

      setText('#loginModalTitle', '\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4');
      setText('#loginModalDesc', '\uC778\uC99D\uB41C \uC0AC\uC6A9\uC790\uB9CC \uC774 \uD398\uC774\uC9C0\uC5D0 \uC811\uADFC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.');
      setText('#userIdLabel', '\uC544\uC774\uB514');
      setText('#userPwLabel', '\uBE44\uBC00\uBC88\uD638');
      setAttr('#userId', 'placeholder', '\uC544\uC774\uB514\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694');
      setAttr('#userPw', 'placeholder', '\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694');
      setText('#loginSubmitBtn', '\uB85C\uADF8\uC778');
      setText('#loginHelpText', '\uC544\uC774\uB514\uB098 \uBE44\uBC00\uBC88\uD638\uAC00 \uAC00\uBB3C\uAC00\uBB3C\uD558\uC2E0\uAC00\uC694?');
      setText('#loginHelpLink', '\uC6B4\uC601\uC790\uC5D0\uAC8C 1:1 \uCE74\uD1A1 \uBB38\uC758\uD558\uAE30');

      setText('#applyModalTitle', '\uCEE4\uBBA4\uB2C8\uD2F0 \uC785\uC7A5 \uC2E0\uCCAD');
      setText('#applyModalDesc', '\uD604\uC7AC 5\uBA85 \uC774\uC0C1 \uB300\uAE30 \uC778\uC6D0\uC774 \uBAA8\uC774\uBA74 \uCEF4\uBBA4\uB2C8\uD2F0\uAC00 \uC815\uC2DD \uAC1C\uC124\uB418\uACE0, \uAC1C\uC124 \uC989\uC2DC \uBB38\uC790\uB85C \uC811\uC18D \uC548\uB0B4\uB97C \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4.');
      setText('#nameLabel', '\uC774\uB984 *');
      setText('#addressLabel', '\uB0B4\uC77C\uC0AC\uC7A5 \uB9E4\uBB3C URL *');
      setText('#phoneLabel', '\uD578\uB4DC\uD3F0 \uBC88\uD638 *');
      setText('#inviteCodeLabel', '\uCD08\uB300 \uCF54\uB4DC (\uC120\uD0DD)');
      setAttr('#name', 'placeholder', '\uC131\uD568\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
      setAttr('#invite_code', 'placeholder', '\uCD08\uB300\uBC1B\uC740 \uACBD\uC6B0\uC5D0\uB9CC \uC785\uB825\uD574\uC8FC\uC138\uC694');
      setHtml('#consentLabel', '\uC218\uC9D1\uD558\uB294 \uAC1C\uC778\uC815\uBCF4 \uD56D\uBAA9 \uBC0F \uC774\uC6A9 \uBAA9\uC801(\uCEE4\uBBA4\uB2C8\uD2F0 \uAC00\uC785 \uC548\uB0B4)\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4. <button type="button" id="openPrivacyBtn" class="text-btn">[\uB0B4\uC6A9 \uBCF4\uAE30]</button>');
      setText('#cancelBtn', '\uCDE8\uC18C');
      setText('#submitBtn', '\uAC00\uC785 \uC2E0\uCCAD\uD558\uAE30');

      setText('#privacyModalTitle', '\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \uBC0F \uB3D9\uC758');
      setText('#privacyHeadPurpose', '\uC218\uC9D1 \uBAA9\uC801');
      setText('#privacyHeadItems', '\uC218\uC9D1 \uD56D\uBAA9');
      setText('#privacyHeadPeriod', '\uBCF4\uC720/\uC774\uC6A9 \uAE30\uAC04');
      setText('#privacyCellPurpose1', '\uD68C\uC6D0 \uC5F0\uACC4, \uBCF8\uC778 \uD655\uC778, \uCEE4\uBBA4\uB2C8\uD2F0 \uC11C\uBE44\uC2A4 \uC548\uB0B4 \uBC0F \uD65C\uB3D9 \uCEE4\uBBA4\uB2C8\uCF00\uC774\uC158');
      setText('#privacyCellItems1', '(\uD544\uC218) \uC774\uB984, \uC5F0\uB77D\uCC98, \uC591\uB3C4 \uB9E4\uBB3C URL');
      setText('#privacyCellPeriod', '\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC885\uB8CC \uC2DC\uAE4C\uC9C0. \uAD00\uB828 \uBC95\uB839\uC5D0 \uB530\uB77C \uBCF4\uAD00\uC774 \uD544\uC694\uD55C \uACBD\uC6B0 \uD574\uB2F9 \uAE30\uAC04\uAE4C\uC9C0 \uBCF4\uAD00\uD569\uB2C8\uB2E4.');
      setText('#privacyCellPurpose2', '\uC11C\uBE44\uC2A4 \uC6B4\uC601, \uD65C\uB3D9 \uC9C0\uC6D0, \uB9E4\uC7A5 \uC0C1\uD0DC \uCCB4\uD06C \uBC0F \uBD80\uC815 \uC774\uC6A9 \uBC29\uC9C0');
      setText('#privacyCellItems2', '(\uD544\uC218) \uD65C\uB3D9 \uB0B4\uC5ED \uBC0F \uC11C\uBE44\uC2A4 \uC774\uC6A9 \uAE30\uB85D');
      setHtml('#privacyNote', '- \uC11C\uBE44\uC2A4 \uC774\uC6A9 \uACFC\uC815\uC5D0\uC11C \uBC29\uBB38 \uC77C\uC2DC, \uC811\uC18D \uD658\uACBD \uC815\uBCF4\uAC00 \uC790\uB3D9 \uC218\uC9D1\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.<br>- \uB3D9\uC758\uB97C \uAC70\uBD80\uD560 \uAD8C\uB9AC\uAC00 \uC788\uC9C0\uB9CC, \uD544\uC218 \uD56D\uBAA9 \uB3D9\uC758 \uAC70\uBD80 \uC2DC \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC774 \uC81C\uD55C\uB429\uB2C8\uB2E4.');

      setText('#btnWriteRetro', '\uC6B4\uC601\uAE30\uB85D \uC4F0\uAE30');
      setText('#btnWriteExpert', '\uC804\uBB38\uAC00 Q&A \uC4F0\uAE30');
      setText('#btnWriteFree', '\uC790\uC720/\uC9C8\uBB38');
      setText('#btnCancelActionSheet', '\uCDE8\uC18C');
      setText('#postTitleLabel', '\uAE00 \uC81C\uBAA9');
      setAttr('#postTitle', 'placeholder', '\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
      setText('#retroMissionsTitle', '\uC120\uD0DD\uD55C \uB9E4\uC7A5 \uC0C1\uD0DC \uD56D\uBAA9\uC740 \uC790\uB3D9 \uD3EC\uD568\uB429\uB2C8\uB2E4.');
      setText('#cancelWriteBtn', '\uCDE8\uC18C');
      setText('#submitWriteBtn', '\uB4F1\uB85D\uD558\uAE30');

      document.querySelectorAll('.log-modal-title').forEach((el) => { el.textContent = '\uC624\uB298 \uB9E4\uC7A5 \uC0C1\uD0DC \uAE30\uB85D'; });
      setText('#logStep1Desc', '1\uB2E8\uACC4: \uC624\uB298 \uD574\uB2F9\uD558\uB294 \uD56D\uBAA9\uC744 \uBAA8\uB450 \uC120\uD0DD\uD574\uC8FC\uC138\uC694');
      setText('#logStep2Desc', '2\uB2E8\uACC4: \uC120\uD0DD\uD55C \uD56D\uBAA9\uBCC4\uB85C \uC0C1\uC138 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
      setText('#btnGoStep2', '\uC0C1\uC138 \uB0B4\uC6A9 \uAE30\uB85D\uD558\uAE30');
      setText('#btnBackStep1', '\uB2E4\uC2DC \uC120\uD0DD');
      setText('#submitLogBtn', '\uAE30\uB85D \uC644\uB8CC');

      setText('#detailInfoTitle', '\uC0C1\uC138 \uC815\uBCF4');
      setText('#detailInfoDesc', '\uB0B4\uC6A9\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.');
      setText('#detailInfoConfirmBtn', '\uD655\uC778');

      setText('#questionModalTitle', '\uC804\uBB38\uAC00\uC5D0\uAC8C \uC9C8\uBB38\uD558\uAE30');
      setText('#questionModalDesc', '\uC0AC\uC7A5\uB2D8\uC758 \uAD6C\uCCB4\uC801\uC778 \uC6B4\uC601 \uC0C1\uD669\uACFC \uAD81\uAE08\uD55C \uC810\uC744 \uC9C8\uBB38\uD574\uC8FC\uC138\uC694. \uC804\uBB38\uAC00\uAC00 \uC9C1\uC811 \uD655\uC778\uD569\uB2C8\uB2E4.');
      setText('#questionTitleLabel', '\uC9C8\uBB38 \uC81C\uBAA9');
      setAttr('#questionTitle', 'placeholder', '\uC9C8\uBB38 \uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694');
      setText('#questionContentLabel', '\uC9C8\uBB38 \uB0B4\uC6A9');
      setAttr('#questionContent', 'placeholder', '\uC0C1\uD669\uACFC \uC9C8\uBB38\uC744 \uAD6C\uCCB4\uC801\uC73C\uB85C \uC801\uC5B4\uC8FC\uC138\uC694.');
      setText('#submitQuestionBtn', '\uB4F1\uB85D\uD558\uAE30');

      setHtml('.community-intro-badge', '<i class="ri-book-open-line" aria-hidden="true"></i> \uCEE4\uBBA4\uB2C8\uD2F0 \uAC00\uC774\uB4DC');
      setText('.community-intro-copy h3', '\uB9E4\uC7A5 \uC0C1\uD0DC\uB97C \uAE30\uB85D\uD574\uC57C \uD558\uB294 \uC774\uC720');
      setText('.community-intro-copy p', '\uC591\uC218\uC790\uC758 \uC2DC\uC120\uC73C\uB85C \uC65C \uC6B4\uC601\uAE30\uB85D\uC774 \uAD8C\uB9AC\uAE08\uACFC \uC2E0\uB8B0\uB97C \uBC14\uAFB8\uB294\uC9C0 \uBA3C\uC800 \uD655\uC778\uD574\uBCF4\uC138\uC694.');

      setText('#statusCheckSection .hero-title', '\uC624\uB298 \uB9E4\uC7A5 \uC0C1\uD0DC \uAE30\uB85D\uD558\uAE30');
      setText('#statusCheckSection .hero-subtitle', '\uC791\uC740 \uAE30\uB85D\uC774 \uC313\uC77C\uC218\uB85D \uB0B4 \uB178\uB825\uACFC \uC131\uACFC\uAC00 \uB354 \uBD84\uBA85\uD558\uAC8C \uB0A8\uC2B5\uB2C8\uB2E4.');
      setText('#statusCheckSection .trust-tooltip-trigger', '\uC9D1\uACC4 \uAE30\uC900 \uBCF4\uAE30');
      setText('#statusCheckSection .trust-tooltip-bubble', '\uB204\uC801 \uC9D1\uACC4 \uAE30\uC900\uC73C\uB85C \uB0B4\uAC00 \uB0A8\uAE34 \uC6B4\uC601\uAE30\uB85D\uACFC \uC804\uBB38\uAC00 \uC9C8\uBB38 \uC218\uB97C \uBCF4\uC5EC\uC90D\uB2C8\uB2E4. \uCE74\uB4DC\uB97C \uB204\uB974\uBA74 \uC804\uCCB4 \uBAA9\uB85D\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.');
      setText('#statusCheckSection .trust-stat:nth-child(1) .stat-label', '\uC6B4\uC601 \uAE30\uB85D');
      setText('#statusCheckSection .trust-stat:nth-child(2) .stat-label', '\uC804\uBB38\uAC00 \uC9C8\uBB38');
      if (btnOpenLogModal) btnOpenLogModal.textContent = '\uC624\uB298\uC758 \uB9E4\uC7A5 \uC0C1\uD0DC 1\uBD84 \uAE30\uB85D\uD558\uAE30';

      setText('.expert-header h3', '\uC804\uBB38\uAC00 Q&A');
      setText('.expert-header p', '\uC804\uBB38\uAC00\uAC00 \uC9C1\uC811 \uB2F5\uBCC0\uD574 \uB4DC\uB9BD\uB2C8\uB2E4.');
      setHtml('.expert-card .expert-question', '<span class=\"q-mark\">Q.</span> \uAD8C\uB9AC\uAE08 5\uCC9C vs \uB9E4\uCD9C 1,200, \uC801\uC815\uD55C \uAE08\uC561\uC77C\uAE4C\uC694?');
      setHtml('.expert-card .expert-answer', '<span class=\"a-mark\">A.</span> \uAD8C\uB9AC\uAE08\uC740 \uB9E4\uCD9C \uCD1D\uC561\uBCF4\uB2E4 \uC6B4\uC601 \uAD6C\uC870\uC640 \uC774\uD6C4 \uACE0\uC815\uBE44\uB97C \uD568\uAED8 \uBD10\uC57C \uD569\uB2C8\uB2E4. \uAC8C\uC2DC\uD310\uC5D0\uC11C \uC804\uCCB4 \uB2F5\uBCC0\uC744 \uD655\uC778\uD574\uBCF4\uC138\uC694.');
      const expertLinks = document.querySelectorAll('.expert-related-links a');
      if (expertLinks[0]) expertLinks[0].textContent = "\uC804\uBB38\uAC00 Q&A | \uAD8C\uB9AC\uAE08 \uD611\uC0C1 \uC2DC '\uC774\uAC83'\uB9CC\uC740 \uC808\uB300 \uAE4E\uC9C0 \uB9C8\uC138\uC694";
      if (expertLinks[1]) expertLinks[1].textContent = '\uC804\uBB38\uAC00 Q&A | \uC591\uC218\uC790\uAC00 \uB193\uCE58\uAE30 \uC26C\uC6B4 \uC228\uC740 \uBE44\uC6A9 3\uAC00\uC9C0';
      setText('.btn-expert-action', '\uB0B4 \uC0C1\uD669 \uC804\uBB38\uAC00\uC5D0\uAC8C \uC9C8\uBB38\uD558\uAE30');

      setText('.insight-section .section-header h3', '\uC0AC\uC7A5\uB2D8\uB4E4\uC774 \uB9CE\uC774 \uBCF4\uB294 \uAE30\uC900');
      const boardHeader = document.querySelector('.board-group-header');
      if (boardHeader) {
        setText('h3', '\uCEE4\uBBA4\uB2C8\uD2F0 \uAC8C\uC2DC\uD310', boardHeader);
        setText('p', '\uB9E4\uC7A5 \uC6B4\uC601 \uD750\uB984\uC744 \uC313\uACE0, \uC804\uBB38\uAC00 \uB2F5\uBCC0\uC744 \uBC1B\uACE0, \uBE44\uC2B7\uD55C \uACE0\uBBFC\uC744 \uB098\uB204\uB294 \uACF5\uAC04\uC785\uB2C8\uB2E4.', boardHeader);
      }
      const boardTabs = document.querySelectorAll('#boardTabs .board-tab');
      if (boardTabs[0]) boardTabs[0].textContent = '\uC6B4\uC601 \uAE30\uB85D';
      if (boardTabs[1]) boardTabs[1].textContent = '\uC804\uBB38\uAC00 Q&A';
      if (boardTabs[2]) boardTabs[2].textContent = '\uC790\uC720/\uC9C8\uBB38';

      const feedCards = document.querySelectorAll('#boardSection .feed-card');
      const feedCopy = [
        {
          avatar: '\uC0AC',
          author: '\uB0B4\uC77C\uC0AC\uC7A5',
          time: '10\uBD84 \uC804',
          tags: ['\uB2E8\uACE8/\uC2E0\uADDC', '\uC9C1\uC6D0 \uC77C\uC815'],
          body: '\uB2E8\uACE8 \uBE44\uC911\uC774 \uC804\uCCB4\uC758 60% \uC815\uB3C4\uB85C \uC720\uC9C0\uB418\uACE0 \uC788\uACE0, \uC2E0\uADDC \uC720\uC785\uB3C4 \uC8FC\uB9D0\uC5D4 \uAFB8\uC900\uD788 \uB4E4\uC5B4\uC654\uC5B4\uC694. \uC9C1\uC6D0 \uC77C\uC815\uB3C4 \uC548\uC815\uC801\uC73C\uB85C \uC6B4\uC601 \uC911\uC785\uB2C8\uB2E4.',
          empty: '\uCCAB \uB313\uAE00\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694.'
        },
        {
          avatar: '\uC0AC',
          author: '\uD589\uBCF5\uAC00\uAC8C',
          time: '1\uC2DC\uAC04 \uC804',
          tags: ['\uC0C1\uAD8C \uBCC0\uD654', '\uB9C8\uCF00\uD305'],
          body: '\uC0C8 \uCE74\uD398\uAC00 \uC624\uD508\uD558\uBA74\uC11C \uC720\uB3D9\uC778\uAD6C\uAC00 \uB298\uC5C8\uC5B4\uC694. \uC778\uC2A4\uD0C0 \uAD11\uACE0\uB3C4 \uC2DC\uC791\uD574\uC11C \uC2E0\uADDC \uC720\uC785 \uCD94\uC774\uB97C \uC880 \uB354 \uC9C0\uCF1C\uBCF4\uB824\uACE0 \uD569\uB2C8\uB2E4.',
          comment: '\uC720\uB3D9\uC778\uAD6C \uC99D\uAC00\uBA74 \uD64D\uBCF4 \uBC18\uC751\uB3C4 \uAC19\uC774 \uBCF4\uC154\uC57C\uACA0\uC5B4\uC694.'
        },
        {
          avatar: '\uC0AC',
          author: '\uBD04\uB0A0\uCE74\uD398',
          commentAuthor: '\uC804\uBB38\uAC00',
          time: '\uC624\uB298 \uB2F5\uBCC0',
          tags: ['\uAD8C\uB9AC\uAE08 \uC0B0\uC815', '\uC2E4\uC0AC\uB840'],
          body: '<strong>Q.</strong> \uAD8C\uB9AC\uAE08 5\uCC9C vs \uB9E4\uCD9C 1,200, \uC801\uC815\uD55C \uAE08\uC561\uC77C\uAE4C\uC694?<br><span style=\"color: var(--text-muted);\">\uAD8C\uB9AC\uAE08\uC740 \uB9E4\uCD9C \uCD1D\uC561\uBCF4\uB2E4 \uC6B4\uC601 \uAD6C\uC870\uC640 \uC774\uD6C4 \uACE0\uC815\uBE44\uB97C \uAC19\uC774 \uBD10\uC57C \uD569\uB2C8\uB2E4.</span>',
          comment: '\uCD5C\uADFC 3\uAC1C\uC6D4 \uCD94\uC774\uD45C\uC640 \uACE0\uC815\uBE44 \uAD6C\uC870\uAC00 \uD568\uAED8 \uD655\uC778\uB3FC\uC57C \uC815\uD655\uD55C \uD310\uB2E8\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4.'
        },
        {
          avatar: '\uC0AC',
          author: '\uB3D9\uB124\uBD84\uC2DD',
          commentAuthor: '\uC804\uBB38\uAC00',
          time: '\uC5B4\uC81C \uB2F5\uBCC0',
          tags: ['\uD611\uC0C1 \uC804\uB7B5', '\uAD8C\uB9AC\uAE08 \uBCF4\uD638'],
          body: '<strong>Q.</strong> \uAD8C\uB9AC\uAE08 \uD611\uC0C1 \uC2DC \uBB34\uC5C7\uB9CC\uD07C\uC740 \uBA3C\uC800 \uAE4E\uC9C0 \uB9D0\uC544\uC57C \uD558\uB098\uC694?<br><span style=\"color: var(--text-muted);\">\uCD08\uBC18 \uAE30\uC900\uC810\uC744 \uB0AE\uCD94\uBA74 \uC774\uD6C4 \uD611\uC0C1\uB3C4 \uBB34\uB108\uC9D1\uB2C8\uB2E4.</span>',
          comment: '\uC2DC\uC124 \uC0C1\uD0DC\uC640 \uB2E8\uACE8 \uACE0\uAC1D \uAE30\uBC18\uCC98\uB7FC \uAE4E\uAE30 \uC5B4\uB824\uC6B4 \uADFC\uAC70\uBD80\uD130 \uBA3C\uC800 \uC815\uB9AC\uD558\uB294 \uAC83\uC774 \uC88B\uC2B5\uB2C8\uB2E4.'
        },
        {
          avatar: '\uC0AC',
          author: '\uC5ED\uC804\uAE40\uBC25',
          commentAuthor: '\uC804\uBB38\uAC00',
          time: '\uC774\uBC88 \uC8FC',
          tags: ['\uC228\uC740 \uBE44\uC6A9', '\uC591\uC218\uC790 \uAD00\uC810'],
          body: '<strong>Q.</strong> \uC591\uC218\uC790\uAC00 \uB193\uCE58\uAE30 \uC26C\uC6B4 \uC228\uC740 \uBE44\uC6A9 3\uAC00\uC9C0\uB294 \uBB34\uC5C7\uC77C\uAE4C\uC694?<br><span style=\"color: var(--text-muted);\">\uBCF4\uC99D\uAE08 \uC678\uC5D0\uB3C4 \uC2E4\uC81C \uC778\uC218 \uC9C1\uC804\uC5D0 \uBE60\uB974\uAC8C \uBC1C\uC0DD\uD558\uB294 \uBE44\uC6A9\uC774 \uC788\uC2B5\uB2C8\uB2E4.</span>',
          comment: '\uCD08\uAE30 \uBCF4\uC218\uBE44\uC640 \uC7AC\uACE0 \uCDA9\uC804 \uBE44\uC6A9, \uBA85\uC758 \uC774\uC804 \uC9C1\uD6C4 \uB4DC\uB294 \uC138\uD305 \uBE44\uC6A9\uC744 \uAF2D \uB530\uB85C \uACC4\uC0B0\uD574\uB450\uC138\uC694.'
        },
        {
          avatar: '\uC0AC',
          author: '\uB0B4\uC77C\uC0AC\uC7A5',
          time: '\uBC29\uAE08 \uC804',
          body: '\uB9E4\uC7A5 \uB9C8\uAC10 \uC2DC\uAC04\uB300\uC5D0 \uAC11\uC790\uAE30 \uD604\uAE08 \uCEF4\uD50C\uB808\uC778\uC774 \uB298\uC5C8\uB294\uB370, \uC6D0\uC778\uC744 \uC5B4\uB514\uBD80\uD130 \uD655\uC778\uD574\uC57C \uD560\uC9C0 \uACE0\uBBFC\uC785\uB2C8\uB2E4.',
          empty: '\uCCAB \uB313\uAE00\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694.'
        }
      ];

      feedCards.forEach((card, index) => {
        const copy = feedCopy[index];
        if (!copy) return;
        const avatar = card.querySelector('.author-avatar');
        const author = card.querySelector('.author-name');
        const time = card.querySelector('.feed-time');
        const content = card.querySelector('.feed-content');
        const tags = card.querySelectorAll('.tag');
        const empty = card.querySelector('.empty-comment');
        const comment = card.querySelector('.comment-item');
        const textarea = card.querySelector('.comment-input');
        const submit = card.querySelector('.submit-comment');
        if (avatar) avatar.textContent = copy.avatar;
        if (author) author.textContent = copy.author;
        if (time) time.textContent = copy.time;
        if (content && copy.body) content.innerHTML = copy.body;
        tags.forEach((tag, tagIndex) => {
          if (copy.tags && copy.tags[tagIndex]) tag.textContent = copy.tags[tagIndex];
        });
        if (empty && copy.empty) empty.textContent = copy.empty;
        if (comment && copy.comment) {
          const authorSpan = comment.querySelector('.comment-author');
          if (authorSpan) {
            const commentAuthor = copy.commentAuthor || copy.author;
            comment.innerHTML = `<span class="comment-author">${getAuthorDisplayHtml(commentAuthor)}</span> ${copy.comment}`;
          }
        }
        if (textarea) textarea.placeholder = '\uC9C8\uBB38\uC774\uB098 \uC758\uACAC\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694';
        if (submit) submit.textContent = '\uB4F1\uB85D';
      });

      const consultLink = document.getElementById('btnConsulting');
      if (consultLink) consultLink.textContent = '\uC804\uBB38\uAC00 1:1 \uC0C1\uB2F4';

      const profileInfo = document.querySelector('.profile-info');
      if (profileInfo) {
        setText('p', '\uC624\uB298\uB3C4 \uD568\uAED8 \uC774\uACA8\uB0B4\uC694!', profileInfo);
      }
      if (btnLogout) btnLogout.textContent = '\uB85C\uADF8\uC544\uC6C3';
      const rewardHeader = document.querySelector('.reward-dashboard .section-header h3');
      if (rewardHeader) rewardHeader.textContent = '\uCC38\uC5EC \uAC00\uB2A5\uD55C \uC774\uBCA4\uD2B8';

      const rewardItems = document.querySelectorAll('.reward-item');
      const rewardCopy = [
        {
          condition: "'\uC624\uB298 \uB9E4\uC7A5 \uC0C1\uD0DC \uAE30\uB85D' 1\uD68C \uC791\uC131 \uC2DC",
          rewardCopy: '\uCCAB \uC6B4\uC601\uAE30\uB85D \uC791\uC131 \uC2DC \uB9AC\uC6CC\uB4DC \uB300\uC0C1\uC774 \uB429\uB2C8\uB2E4.',
          title: '\uCCAB\uAE00\uC4F0\uAE30',
          rule: '\uC624\uB298 \uB9E4\uC7A5 \uC0C1\uD0DC \uAE30\uB85D 1\uD68C \uC791\uC131 \uC2DC'
        },
        {
          condition: "'\uC6B4\uC601\uAE30\uB85D' '\uC804\uBB38\uAC00 Q&A' '\uC790\uC720/\uC9C8\uBB38' \uAC8C\uC2DC\uD310 \uC911 1\uACF3\uC774\uB77C\uB3C4 3\uC77C \uC774\uC0C1 \uC791\uC131 \uC2DC",
          rewardCopy: '3\uC77C \uC774\uC0C1 \uC791\uC131 \uC2DC \uC5F0\uC18D \uD65C\uB3D9 \uB9AC\uC6CC\uB4DC \uB300\uC0C1\uC774 \uB429\uB2C8\uB2E4.',
          title: '\uC5F0\uC18D 3\uC77C \uC791\uC131',
          rule: '3\uC77C \uC774\uC0C1 \uC791\uC131 \uC2DC'
        },
        {
          condition: "'\uC6B4\uC601\uAE30\uB85D' '\uC804\uBB38\uAC00 Q&A' '\uC790\uC720/\uC9C8\uBB38' \uAC8C\uC2DC\uD310 \uC911 1\uACF3\uC774\uB77C\uB3C4 10\uC77C \uC774\uC0C1 \uC791\uC131 \uC2DC, 2\uC8FC\uC5D0 \uD55C\uBC88 \uC120\uC815\uD558\uC5EC \uC9C0\uAE09",
          rewardCopy: '10\uC77C \uC774\uC0C1 \uC791\uC131\uD55C \uC0AC\uC7A5\uB2D8\uC744 2\uC8FC\uC5D0 \uD55C \uBC88 \uC120\uC815\uD558\uC5EC \uC9C0\uAE09\uD569\uB2C8\uB2E4.',
          title: '\uBCA0\uC2A4\uD2B8 \uC0AC\uC7A5\uB2D8 \uB9AC\uC6CC\uB4DC',
          rule: '10\uC77C \uC774\uC0C1 \uC791\uC131 \uC2DC 2\uC8FC\uC5D0 \uD55C \uBC88 \uC120\uC815'
        },
        {
          condition: '\uC6B4\uC601\uC790\uAC00 \uC62C\uB9B0 \uC774\uBCA4\uD2B8\uC5D0 \uCC38\uC5EC\uD558\uC5EC \uB2EC\uC131 \uC2DC',
          rewardCopy: '\uC6B4\uC601\uC790 \uC774\uBCA4\uD2B8 \uACF5\uC9C0\uC5D0 \uCC38\uC5EC\uD558\uBA74 \uB9AC\uC6CC\uB4DC\uAC00 \uC9C0\uAE09\uB429\uB2C8\uB2E4.',
          title: '\uC6B4\uC601\uC790 \uC774\uBCA4\uD2B8 \uCC38\uC5EC',
          rule: '\uC6B4\uC601\uC790 \uC774\uBCA4\uD2B8 \uCC38\uC5EC \uC2DC'
        }
      ];
      rewardItems.forEach((item, index) => {
        const copy = rewardCopy[index];
        if (!copy) return;
        item.dataset.condition = copy.condition;
        item.dataset.rewardCopy = copy.rewardCopy;
        setText('.reward-title', copy.title, item);
        setText('.reward-rule', copy.rule, item);
        setText('.reward-thumb-arrow', '\u2192', item);
      });

      const couponHeader = document.querySelector('.coupon-box .section-header');
      if (couponHeader) {
        setText('h3', '\uBC1B\uC740 \uCFE0\uD3F0\uD568', couponHeader);
        setText('p', '\uCC38\uC5EC\uD615 \uB9AC\uC6CC\uB4DC(\uAE30\uD504\uD2F0\uCF58)\uAC00 \uBCF4\uAD00\uB418\uB294 \uACF3\uC785\uB2C8\uB2E4.', couponHeader);
      }
      setAttr('#couponImageTarget', 'alt', '\uCFE0\uD3F0 \uC0C1\uC138 \uC774\uBBF8\uC9C0');
      setText('#kakaoConfirmTitle', '\uC804\uBB38\uAC00 \uC0C1\uB2F4 \uC548\uB0B4');
      setHtml('#kakaoConfirmDesc', '\uC0C1\uC138 \uC0C1\uB2F4\uC744 \uC704\uD574 \uCE74\uCE74\uC624\uD1A1 \uCC44\uB110\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.<br>\uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?');
      setText('#kakaoCancelBtn', '\uC544\uB2C8\uC624');
      setText('#kakaoConfirmBtn', '\uC774\uB3D9\uD558\uAE30');
      setText('#rewardInfoTitle', '\uBCF4\uC0C1 \uB2EC\uC131 \uC870\uAC74');

      if (communityIntroPage) {
        const introCopy = {
          hero: {
            eyebrow: '커뮤니티 소개',
            title: '매장 상태를 기록해야 하는 이유',
            subtitle: '손님처럼 고민해 가게를 바꿨다면, 양수자 관점으로는 설명해보셨나요?'
          },
          context: {
            body: '사장님은 이미 알고 계십니다. 손님 입장에서 봐야 가게가 좋아진다는 걸요. 양도양수도 같습니다. 양수자는 매출이 아니라 <strong>“이 가게가 왜 유지되는지”</strong>를 봅니다.'
          },
          problem: {
            title: '그래서 대부분의 매물이 비슷해 보입니다',
            lead: '매출도 있고, 사진도 있고, 설명도 있지만 양수자 입장에서는 이렇게 느껴집니다.',
            items: [
              '다 비슷한 말들 (“단골 많습니다”, “상권 좋습니다”)',
              '근거 없이 적힌 매출',
              '운영 방식은 보이지 않음'
            ],
            quote: '인수 후에 운영을 했을 때 괜찮은 매장인지 상상이 되지 않습니다.'
          },
          criteria: {
            title: '양수자는 이렇게 판단합니다',
            items: [
              '이 매출, 내가 이어갈 수 있을까?',
              '단골은 계속 남을까?',
              '운영 구조는 재현 가능한가?',
              '내가 개선할 수 있는 여지가 있을까?'
            ],
            quote: '이 질문에 답이 없으면 모든 매물은 비슷해 보입니다.'
          },
          solution: {
            title: '운영을 설명할 수 있는 기록을 남깁니다',
            lead: '매출을 더 좋아 보이게 만드는 기능이 아닙니다. 운영이 어떻게 돌아가는지 보이게 만드는 기록입니다.',
            values: [
              { title: '양도에서', body: '운영이 보이면 납득됩니다.' },
              { title: '지금 운영에서', body: '기록을 쌓으면 패턴이 보입니다.' }
            ],
            note: '그래서 기록 = 매출 유지 장치입니다.'
          },
          trust: {
            title: '신뢰는 증명하는 게 아니라, 의심을 줄이는 구조가 필요합니다',
            lead: '숫자가 아니라 흔적이 더 의심을 줄이고 신뢰를 줄 수 있습니다.',
            compare: [
              '아무 기록도 없는 매장',
              '운영 흔적이 남아 있는 매장'
            ],
            quote: '양수자는 “정답”이 아니라 “진짜 운영한 흔적”을 보고 판단합니다.'
          },
          cta: {
            title: '기록하는 사장님만, 선택받습니다',
            body: '양수자 시선에서 내 매장을 설명할 근거를 커뮤니티에서 쌓아보세요.',
            button: '지금 바로 기록하기'
          }
        };

        setText('.sub-page-header h3', '커뮤니티 소개', communityIntroPage);
        setText('.intro-eyebrow', introCopy.hero.eyebrow, communityIntroPage);
        setText('.intro-hero-panel h1', introCopy.hero.title, communityIntroPage);
        setText('.intro-hero-subtitle', introCopy.hero.subtitle, communityIntroPage);
        setHtml('.intro-article-intro', introCopy.context.body, communityIntroPage);

        setText('.intro-panel-problem h2', introCopy.problem.title, communityIntroPage);
        setText('.intro-panel-problem .intro-panel-lead', introCopy.problem.lead, communityIntroPage);
        const introProblemItems = communityIntroPage.querySelectorAll('.intro-problem-list li');
        introCopy.problem.items.forEach((item, index) => {
          if (introProblemItems[index]) introProblemItems[index].textContent = item;
        });
        setText('.intro-panel-problem .intro-highlight-quote', introCopy.problem.quote, communityIntroPage);

        setText('.intro-panel-criteria h2', introCopy.criteria.title, communityIntroPage);
        const introCriteriaItems = communityIntroPage.querySelectorAll('.intro-criteria-list li');
        introCopy.criteria.items.forEach((item, index) => {
          if (introCriteriaItems[index]) introCriteriaItems[index].textContent = item;
        });
        setText('.intro-panel-criteria .intro-highlight-quote', introCopy.criteria.quote, communityIntroPage);

        setText('.intro-panel-solution h2', introCopy.solution.title, communityIntroPage);
        setText('.intro-panel-solution .intro-panel-lead', introCopy.solution.lead, communityIntroPage);
        const introValueItems = communityIntroPage.querySelectorAll('.intro-value-item');
        introCopy.solution.values.forEach((item, index) => {
          if (introValueItems[index]) introValueItems[index].innerHTML = `<strong>${item.title}</strong>${item.body}`;
        });
        setText('.intro-reading-note', introCopy.solution.note, communityIntroPage);

        setText('.intro-panel-trust h2', introCopy.trust.title, communityIntroPage);
        setText('.intro-panel-trust .intro-panel-lead', introCopy.trust.lead, communityIntroPage);
        const introCompareItems = communityIntroPage.querySelectorAll('.intro-compare-item');
        introCopy.trust.compare.forEach((item, index) => {
          if (introCompareItems[index]) introCompareItems[index].textContent = item;
        });
        setText('.intro-panel-trust .intro-highlight-quote', introCopy.trust.quote, communityIntroPage);

        setText('.intro-panel-cta h3', introCopy.cta.title, communityIntroPage);
        setText('.intro-panel-cta p', introCopy.cta.body, communityIntroPage);
        if (btnIntroStart) btnIntroStart.textContent = introCopy.cta.button;
      }

      if (btnTemplate) {
        btnTemplate.textContent = t.templateGuideLink;
      }

      const insightCards = document.querySelectorAll('#insightScrollContainer .insight-card-large');
      insightCards.forEach((card, index) => {
        const copy = t.insight[index];
        if (!copy) return;
        const kicker = card.querySelector('.insight-card-kicker');
        const title = card.querySelector('h4');
        const desc = card.querySelector('p');
        const cta = card.querySelector('.insight-card-cta');
        if (kicker) kicker.textContent = copy.kicker;
        if (title) title.textContent = copy.title;
        if (desc) desc.textContent = copy.desc;
        if (cta) cta.textContent = copy.cta;
      });

      if (!templatePage) return;

      const headerTitle = templatePage.querySelector('.sub-page-header h3');
      if (headerTitle) headerTitle.textContent = t.hero.header;

      const heroChip = templatePage.querySelector('.template-guide-chip');
      const heroTitle = templatePage.querySelector('.template-guide-hero h1');
      const heroDesc = templatePage.querySelector('.template-guide-subcopy');
      const heroNote = templatePage.querySelector('.template-guide-note');
      if (heroChip) heroChip.textContent = t.hero.chip;
      if (heroTitle) heroTitle.textContent = t.hero.title;
      if (heroDesc) heroDesc.textContent = t.hero.desc;
      if (heroNote) heroNote.textContent = t.hero.note;

      const exampleChip = templatePage.querySelector('.template-example-chip');
      const exampleTitle = templatePage.querySelector('.template-example-summary-title');
      const exampleDesc = templatePage.querySelector('.template-example-summary-desc');
      const exampleToggle = templatePage.querySelector('.template-example-toggle');
      const exampleQuote = templatePage.querySelector('.template-example-quote');
      const exampleSections = templatePage.querySelector('.template-example-sections');
      const exampleClosing = templatePage.querySelector('.template-example-closing');
      if (exampleChip) exampleChip.textContent = t.example.chip;
      if (exampleTitle) exampleTitle.textContent = t.example.title;
      if (exampleDesc) exampleDesc.textContent = t.example.desc;
      if (exampleToggle) {
        exampleToggle.dataset.closedLabel = t.example.toggleClosed;
        exampleToggle.dataset.openLabel = t.example.toggleOpen;
        exampleToggle.textContent = t.example.toggleClosed;
      }
      if (exampleQuote) exampleQuote.textContent = t.example.quote;
      if (exampleSections) {
        exampleSections.innerHTML = t.example.sections.map((section) => `
          <section class="template-example-section">
            <h3>${section.title}</h3>
            <dl class="template-example-list">
              ${section.items.map((item) => `
                <div class="template-example-row${item.quoted ? ' is-quoted' : ''}">
                  <dt>${item.label}</dt>
                  <dd>${item.quoted ? `“${item.value}”` : item.value}</dd>
                </div>
              `).join('')}
            </dl>
          </section>
        `).join('');
      }
      if (exampleClosing) exampleClosing.textContent = t.example.closing;

      const worksheetChip = templatePage.querySelector('.template-worksheet-chip');
      const worksheetTitle = templatePage.querySelector('.template-worksheet-title');
      const worksheetDesc = templatePage.querySelector('.template-worksheet-desc');
      const worksheetGroups = templatePage.querySelector('.template-worksheet-groups');
      if (worksheetChip) worksheetChip.textContent = t.template.chip;
      if (worksheetTitle) worksheetTitle.textContent = t.template.title;
      if (worksheetDesc) worksheetDesc.textContent = t.template.desc;
      if (worksheetGroups) {
        worksheetGroups.innerHTML = t.template.sections.map((section) => `
          <section class="template-worksheet-group">
            <div class="template-worksheet-group-head">
              <div>
                <h3 class="template-worksheet-group-title">${section.title}</h3>
                <p class="template-worksheet-group-desc">${section.desc}</p>
              </div>
              <span class="template-worksheet-check-caption">${t.template.checkCaption}</span>
            </div>
            <div class="template-field-list">
              ${section.fields.map((field) => `
                <label class="template-field">
                  <span class="template-field-copy">
                    <strong class="template-field-label">${field}</strong>
                    <span class="template-field-line" aria-hidden="true"></span>
                  </span>
                  <span class="template-field-check">
                    <input type="checkbox" class="template-field-input" />
                    <span class="template-field-box" aria-hidden="true"></span>
                  </span>
                </label>
              `).join('')}
            </div>
          </section>
        `).join('');
      }

      const ctaNote = templatePage.querySelector('.template-cta-note');
      if (ctaNote) ctaNote.textContent = t.cta.note;
      if (btnTemplateStartRecord) btnTemplateStartRecord.textContent = t.cta.button;
    };

    hydrateTemplateGuideCopy();

    const syncTemplateExampleToggle = () => {
      if (!templatePage) return;
      const accordion = templatePage.querySelector('.template-example-accordion');
      const toggle = templatePage.querySelector('.template-example-toggle');
      if (!accordion || !toggle) return;
      toggle.textContent = accordion.open ? toggle.dataset.openLabel : toggle.dataset.closedLabel;
    };

    const syncTemplateChecklistState = () => {
      if (!templatePage) return;
      templatePage.querySelectorAll('.template-field').forEach((field) => {
        const input = field.querySelector('.template-field-input');
        field.classList.toggle('is-checked', Boolean(input && input.checked));
      });
    };

    syncTemplateExampleToggle();
    syncTemplateChecklistState();

    if (templatePage && !templatePage.dataset.templateUiBound) {
      const exampleAccordion = templatePage.querySelector('.template-example-accordion');
      if (exampleAccordion) {
        exampleAccordion.addEventListener('toggle', syncTemplateExampleToggle);
      }
      templatePage.addEventListener('change', (e) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        if (!e.target.classList.contains('template-field-input')) return;
        const field = e.target.closest('.template-field');
        if (field) field.classList.toggle('is-checked', e.target.checked);
      });
      templatePage.dataset.templateUiBound = 'true';
    }

    if (btnTemplate) {
      btnTemplate.addEventListener('click', () => {
        if (!isLoggedIn) {
          if (loginModal) loginModal.classList.add('active');
          return;
        }
        if (templatePage) templatePage.classList.add('active');
      });
    }

    const openCommunityIntroPage = () => {
      if (!isLoggedIn) {
        if (loginModal) loginModal.classList.add('active');
        return;
      }
      if (communityIntroPage) communityIntroPage.classList.add('active');
    };

    const closeCommunityIntroPage = () => {
      if (communityIntroPage) communityIntroPage.classList.remove('active');
    };

    if (btnOpenCommunityIntro) btnOpenCommunityIntro.addEventListener('click', openCommunityIntroPage);
    if (closeCommunityIntroBtn) closeCommunityIntroBtn.addEventListener('click', closeCommunityIntroPage);
    if (communityIntroPage) {
      communityIntroPage.addEventListener('click', (e) => {
        if (e.target === communityIntroPage) closeCommunityIntroPage();
      });
    }
    if (btnIntroStart) {
      btnIntroStart.addEventListener('click', () => {
        closeCommunityIntroPage();
        openLogModal();
      });
    }

    // 인사이트 섹션 내 체크리스트 카드 클릭 → 템플릿 서브페이지로 이동
    const btnScrollToInsight = document.getElementById('btnScrollToInsight');
    if (btnScrollToInsight) {
      btnScrollToInsight.addEventListener('click', () => {
        if (!isLoggedIn) {
          if (loginModal) loginModal.classList.add('active');
          return;
        }
        if (templatePage) templatePage.classList.add('active');
      });
    }
    
    const closeTemplateView = () => {
      if (templatePage) templatePage.classList.remove('active');
    };

    if (closeTemplateBtn) closeTemplateBtn.addEventListener('click', closeTemplateView);
    if (btnTemplateStartRecord) {
      btnTemplateStartRecord.addEventListener('click', () => {
        closeTemplateView();
        openLogModal();
      });
    }

    
    // 초기 로드 시 탭 셋업
    if (homeActions) homeActions.style.display = 'flex'; // 초기 상태

    // --- 4차 피드백: 자유/회고 게시판 탭 전환 로직 ---
    const boardTabs = document.querySelectorAll('.board-tab');
    const boardPanes = document.querySelectorAll('.board-pane');
    const activateBoardTab = (targetId) => {
      boardTabs.forEach(t => t.classList.remove('active'));
      boardPanes.forEach(p => p.style.display = 'none');

      const activeTab = document.querySelector(`.board-tab[data-board="${targetId}"]`);
      const activePane = document.getElementById(targetId);

      if(activeTab) activeTab.classList.add('active');
      if(activePane) activePane.style.display = 'block';
      if (typeof renderBoardPane === 'function') renderBoardPane(targetId);
    };

    boardTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activateBoardTab(tab.getAttribute('data-board'));
      });
    });

    // --- 5차 피드백: 미션 추천(랜덤) 로직 (직접 Pool 참조) ---
    const btnRandomMission = document.getElementById('btnRandomMission');
    const btnRandomMissionActive = document.getElementById('btnRandomMissionActive');
    
    const applyRandomMissions = () => {
      if (!isLoggedIn) {
        if (loginModal) loginModal.classList.add('active');
        return;
      }
      if(!missionPool || missionPool.length === 0) return;
      let arr = [...missionPool];
      arr.sort(() => Math.random() - 0.5);
      selectedMissionIds = [];
      for(let i=0; i<3 && i<arr.length; i++) {
        selectedMissionIds.push(arr[i].id);
      }
      if (typeof renderActiveMissions === 'function') {
        renderActiveMissions();
      }
    };

    if(btnRandomMission) {
      btnRandomMission.addEventListener('click', applyRandomMissions);
    }
    if(btnRandomMissionActive) {
      btnRandomMissionActive.addEventListener('click', applyRandomMissions);
    }

    // --- 4차 피드백: 글쓰기 액션시트 및 모달 내부 탭 제어 ---
    const btnCancelActionSheet = document.getElementById('btnCancelActionSheet');
    const btnWriteFree = document.getElementById('btnWriteFree');
    const btnWriteRetro = document.getElementById('btnWriteRetro');
    const btnWriteExpert = document.getElementById('btnWriteExpert');
    const retroMissionsContainer = document.getElementById('retroMissionsContainer');
    const myRetroTags = document.getElementById('myRetroTags');
    const writeModalTitle = document.getElementById('writeModalTitle');
    const postContent = document.getElementById('postContent');

    const closeActionSheet = () => { if(writeActionSheet) writeActionSheet.classList.remove('active'); };
    if(btnCancelActionSheet) btnCancelActionSheet.addEventListener('click', closeActionSheet);
    if(writeActionSheet) writeActionSheet.addEventListener('click', (e) => { if (e.target === writeActionSheet) closeActionSheet(); });

    // Expose openWriteModalAs to window for global access
    window.openWriteModalAs = (type, initialText = '') => {
      closeActionSheet();
      currentWriteType = type;
      if (postTitleInput) postTitleInput.value = '';
      postContent.value = initialText;
      if(type === 'retro') {
        if (postTitleInput) postTitleInput.value = '오늘 매장 상태 기록';
        retroMissionsContainer.style.display = 'block';
        writeModalTitle.textContent = '운영기록 쓰기';
        if (writeModalDesc) writeModalDesc.textContent = '오늘 체크한 매장 상태를 게시글로 정리해보세요.';
        if (postContent) postContent.placeholder = '오늘 매장 상태와 느낀 점을 정리해보세요.';
        
        // Populate retro tags
        const completedCheckboxes = document.querySelectorAll('.active-checkbox:checked');
        myRetroTags.innerHTML = '';
        if(completedCheckboxes.length > 0) {
          completedCheckboxes.forEach(chk => {
            myRetroTags.innerHTML += `<div>✔️ [${chk.dataset.tag}] ${chk.dataset.text}</div>`;
          });
        } else {
          myRetroTags.innerHTML = '<span style="color:var(--text-muted)">아직 확인된 상태 항목이 없습니다.</span>';
        }
      } else {
        retroMissionsContainer.style.display = 'none';
        writeModalTitle.textContent = '자유/질문 쓰기';
        if (writeModalDesc) writeModalDesc.textContent = '자유롭게 나누고 싶은 이야기나 질문을 남겨주세요.';
        if (postContent) postContent.placeholder = '자유롭게 나누고 싶은 이야기나 질문을 적어보세요.';
      }
      writeModal.classList.add('active');
    };

    if(btnWriteFree) btnWriteFree.addEventListener('click', () => window.openWriteModalAs('free'));
    // 운영기록 쓰기: 동일한 2단계 로그 폼 사용
    if(btnWriteRetro) btnWriteRetro.addEventListener('click', () => {
      closeActionSheet();
      openLogModal();
    });
    if(btnWriteExpert) btnWriteExpert.addEventListener('click', () => {
      closeActionSheet();
      window.openQuestionModal();
    });

    // --- 글로벌 클릭 기능 연동 ---
    window.openDetailModal = (title, desc) => {
      const modal = document.getElementById('detailInfoModal');
      const titleEl = document.getElementById('detailInfoTitle');
      const descEl = document.getElementById('detailInfoDesc');
      if(modal && titleEl && descEl) {
        titleEl.textContent = title;
        descEl.textContent = desc;
        modal.classList.add('active');
      }
    };

    function updateTrustDashboardCounts() {
      const boardEntries = window.boardEntries || {};
      const myRetroCards = (boardEntries['board-free'] || []).filter(entry => isCurrentUsersAuthor(entry));
      const myExpertCards = (boardEntries['board-expert'] || []).filter(entry => isCurrentUsersAuthor(entry));
      const trustRetroCount = document.getElementById('trustRetroCount');
      const trustExpertCount = document.getElementById('trustExpertCount');
      if (trustRetroCount) trustRetroCount.textContent = String(myRetroCards.length) + '\uAC74';
      if (trustExpertCount) trustExpertCount.textContent = String(myExpertCards.length) + '\uAC74';
    }

    function renderTrustActivityList(type = 'retro') {
      const trustAssetModalTitle = document.getElementById('trustAssetModalTitle');
      const trustAssetHeroTitle = document.getElementById('trustAssetHeroTitle');
      const trustAssetHeroDesc = document.getElementById('trustAssetHeroDesc');
      const trustAssetListTitle = document.getElementById('trustAssetListTitle');
      const trustActivityList = document.getElementById('trustActivityList');
      if (!trustActivityList) return;

      const config = type === 'expert'
        ? {
            modalTitle: '전문가 질문 모아보기',
            heroTitle: '전문가 질문 모아보기',
            heroDesc: '내가 올린 전문가 질문과 답변 흐름을 한 번에 확인할 수 있습니다.',
            listTitle: '전문가 질문 목록',
            emptyText: '등록된 전문가 질문이 없습니다.',
            cards: (window.boardEntries?.['board-expert'] || []).filter(card => {
              return isCurrentUsersAuthor(card);
            })
          }
        : {
            modalTitle: '운영기록 모아보기',
            heroTitle: '운영기록 모아보기',
            heroDesc: '지금까지 내가 남긴 운영기록만 목록으로 확인할 수 있습니다.',
            listTitle: '운영기록 목록',
            emptyText: '등록된 운영기록이 없습니다.',
            cards: (window.boardEntries?.['board-free'] || []).filter(card => {
              return isCurrentUsersAuthor(card);
            })
          };

      const actionBtn = document.getElementById('trustAssetActionBtn');
      if (actionBtn) {
        actionBtn.textContent = type === 'expert' ? '전문가 Q&A 쓰기' : '운영기록 쓰기';
        actionBtn.onclick = () => {
          document.getElementById('trustAssetModal').classList.remove('active');
          if (type === 'expert') {
            window.openQuestionModal();
          } else {
            openLogModal();
          }
        };
      }

      if (trustAssetModalTitle) trustAssetModalTitle.textContent = config.modalTitle;
      if (trustAssetHeroTitle) trustAssetHeroTitle.textContent = config.heroTitle;
      if (trustAssetHeroDesc) trustAssetHeroDesc.textContent = config.heroDesc;
      if (trustAssetListTitle) trustAssetListTitle.textContent = config.listTitle;

      if (!config.cards.length) {
        trustActivityList.innerHTML = `<div style="padding:16px; border:1px solid var(--border-color); border-radius:12px; color:var(--text-muted); font-size:14px;">${config.emptyText}</div>`;
        return;
      }

      trustActivityList.innerHTML = config.cards.map(card => {
        const postId = card.postId || '';
        const time = card.time || '';
        const content = card.contentText || '';
        const hasExpertReply = !!card.hasExpertReply;
        const statusHtml = type === 'expert'
          ? `<div style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:${hasExpertReply ? '#0f9d58' : '#f57c00'};">${hasExpertReply ? '답변 완료' : '답변 대기'}</div>`
          : '';
        return `
          <button type="button" onclick="openBoardPost('${type === 'expert' ? 'board-expert' : 'board-free'}', '${postId}')" style="width:100%; text-align:left; padding:16px; border:1px solid var(--border-color); border-radius:12px; background:var(--white); cursor:pointer; font:inherit;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px;">
              <div style="font-size:12px; color:var(--text-muted);">${time}</div>
              ${statusHtml}
            </div>
            <div style="font-size:14px; color:var(--text-main); line-height:1.6;">${content}</div>
          </button>
        `;
      }).join('');
    }

    window.openTrustAssetModal = (type = 'retro') => {
      const modal = document.getElementById('trustAssetModal');
      renderTrustActivityList(type);
      if(modal) modal.classList.add('active');
    };

    window.openBoardPost = (boardId, postId) => {
      const trustModal = document.getElementById('trustAssetModal');
      if (trustModal) trustModal.classList.remove('active');

      const targetEntries = window.boardEntries?.[boardId] || [];
      const targetIndex = targetEntries.findIndex(entry => entry.postId === postId);
      if (targetIndex >= 0) {
        boardPageState[boardId] = Math.floor(targetIndex / POSTS_PER_PAGE) + 1;
      }

      switchTab('tab-community');
      activateBoardTab(boardId);

      window.setTimeout(() => {
        const targetCard = document.querySelector(`#${boardId} [data-post-id="${postId}"]`);
        if (!targetCard) return;

        const detailArea = targetCard.querySelector('.feed-comments');
        if (detailArea) detailArea.style.display = 'block';
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('is-focused');

        window.setTimeout(() => {
          targetCard.classList.remove('is-focused');
        }, 2200);
      }, 120);
    };

    window.openExpertBoard = (postId) => {
      if(!isLoggedIn) {
        if(loginModal) loginModal.classList.add('active');
        return;
      }

      const targetEntries = window.boardEntries?.['board-expert'] || [];
      const targetIndex = targetEntries.findIndex(entry => entry.postId === postId);
      if (targetIndex >= 0) {
        boardPageState['board-expert'] = Math.floor(targetIndex / POSTS_PER_PAGE) + 1;
      }

      switchTab('tab-community');
      activateBoardTab('board-expert');

      window.setTimeout(() => {
        const targetCard = document.querySelector(`#board-expert [data-post-id="${postId}"]`);
        if(!targetCard) return;

        document.querySelectorAll('#board-expert .feed-card').forEach(card => {
          card.classList.remove('is-focused');
        });

        const detailArea = targetCard.querySelector('.feed-comments');
        if(detailArea) detailArea.style.display = 'block';

        targetCard.classList.add('is-focused');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        window.setTimeout(() => {
          targetCard.classList.remove('is-focused');
        }, 2200);
      }, 150);
    };

    window.openQuestionModal = () => {
      if(!isLoggedIn) {
        if(loginModal) loginModal.classList.add('active');
        return;
      }
      const modal = document.getElementById('questionModal');
      const questionTitle = document.getElementById('questionTitle');
      const questionContent = document.getElementById('questionContent');
      if (questionTitle) questionTitle.value = '';
      if (questionContent) questionContent.value = '';
      if(modal) modal.classList.add('active');
    };

    const questionModal = document.getElementById('questionModal');
    const submitQuestionBtn = document.getElementById('submitQuestionBtn');
    if (questionModal) {
      questionModal.addEventListener('click', (e) => {
        if (e.target === questionModal) questionModal.classList.remove('active');
      });
    }

    if (submitQuestionBtn) {
      submitQuestionBtn.addEventListener('click', async () => {
        const questionTitle = document.getElementById('questionTitle');
        const questionContent = document.getElementById('questionContent');
        const title = questionTitle ? questionTitle.value.trim() : '';
        const content = questionContent ? questionContent.value.trim() : '';

        if (!title || !content) {
          alert('질문 제목과 내용을 모두 입력해주세요.');
          return;
        }

        if(!supabaseClient) {
          alert('DB 연결이 필요합니다.');
          return;
        }

        submitQuestionBtn.disabled = true;
        submitQuestionBtn.textContent = '등록하는 중...';

        const { error } = await supabaseClient.from('posts').insert([{
          board_type: 'expert',
          author: getCurrentUserDisplayName(),
          author_id: getCurrentUserId(),
          author_role: getCurrentUserRole(),
          content: `<strong>${title}</strong><br>${content.replace(/\n/g, '<br>')}`,
          retro_tags: null
        }]);

        submitQuestionBtn.disabled = false;
        submitQuestionBtn.textContent = '등록하기';

        if (error) {
          console.error(error);
          alert('전문가 질문 등록 중 오류가 발생했습니다.');
          return;
        }

        alert('전문가 Q&A 글이 등록되었습니다.');
        if (questionTitle) questionTitle.value = '';
        if (questionContent) questionContent.value = '';
        if (questionModal) questionModal.classList.remove('active');
        document.querySelector('.board-tab[data-board="board-expert"]').click();
        if(typeof fetchPosts === 'function') fetchPosts();
      });
    }




    // --- 4차 피드백: 카톡 상담 모달 ---
    const kakaoConfirmModal = document.getElementById('kakaoConfirmModal');
    const btnConsulting = document.getElementById('btnConsulting');
    const btnConsultKakao = document.getElementById('btnConsultKakao');
    const kakaoCancelBtn = document.getElementById('kakaoCancelBtn');
    const kakaoConfirmBtn = document.getElementById('kakaoConfirmBtn');

    const openKakaoModal = (e) => {
      e.preventDefault();
      if(kakaoConfirmModal) kakaoConfirmModal.classList.add('active');
    };
    if(btnConsulting) btnConsulting.addEventListener('click', openKakaoModal);
    if(btnConsultKakao) btnConsultKakao.addEventListener('click', openKakaoModal);

    const closeKakaoModal = () => { if(kakaoConfirmModal) kakaoConfirmModal.classList.remove('active'); };
    if(kakaoCancelBtn) kakaoCancelBtn.addEventListener('click', closeKakaoModal);
    if(kakaoConfirmModal) kakaoConfirmModal.addEventListener('click', (e) => { if(e.target===kakaoConfirmModal) closeKakaoModal(); });

    if(kakaoConfirmBtn) {
      kakaoConfirmBtn.addEventListener('click', () => {
        window.open('https://pf.kakao.com/_Txdlrxj/chat', '_blank');
        closeKakaoModal();
      });
    }

    // --- 4차 피드백: 템플릿 서브페이지 최상단 스크롤 ---
    const scrollToTopSubBtn = document.getElementById('scrollToTopSubBtn');
    if(scrollToTopSubBtn) {
      const subContent = document.querySelector('.sub-page-content');
      scrollToTopSubBtn.addEventListener('click', () => {
        if(subContent) subContent.scrollTo({top: 0, behavior: 'smooth'});
      });
    }

    // --- 4차 피드백: 리워드 상세 모달 ---
    const rewardInfoModal = document.getElementById('rewardInfoModal');
    const closeRewardInfoBtn = document.getElementById('closeRewardInfoBtn');
    const rewardInfoDesc = document.getElementById('rewardInfoDesc');
    document.querySelectorAll('.reward-item').forEach(item => {
      item.addEventListener('click', () => {
        const title = item.querySelector('.reward-title').textContent;
        const status = item.querySelector('.reward-status').textContent;
        const condition = item.dataset.condition || '';
        const rewardCopy = item.dataset.rewardCopy || '';
        if(rewardInfoModal) {
          rewardInfoDesc.innerHTML = `<strong style="font-size:16px;">[${title}]</strong><br><br>달성 조건: ${condition}<br><br>현재 상태: <span style="color:var(--primary); font-weight:bold;">${status}</span><br><br>${rewardCopy}`;
          rewardInfoModal.classList.add('active');
        }
      });
    });
    const closeRewardInfo = () => { if(rewardInfoModal) rewardInfoModal.classList.remove('active'); };
    if(closeRewardInfoBtn) closeRewardInfoBtn.addEventListener('click', closeRewardInfo);
    if(rewardInfoModal) rewardInfoModal.addEventListener('click', (e) => { if(e.target===rewardInfoModal) closeRewardInfo(); });

    // --- 4차 피드백: 쿠폰 딤드 뷰어 모달 ---
    const couponImageViewer = document.getElementById('couponImageViewer');
    const couponImageTarget = document.getElementById('couponImageTarget');
    const couponGrid = document.getElementById('couponGrid');
    if (couponGrid) {
      couponGrid.addEventListener('error', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLImageElement)) return;
        if (!target.matches('[data-coupon-image="true"]')) return;

        const card = target.closest('.coupon-card');
        if (!card) return;

        const title = target.getAttribute('data-coupon-title') || '쿠폰 이미지';
        card.className = 'coupon-card empty';
        card.innerHTML = `<span>${title} 이미지를 불러오지 못했습니다</span>`;
      }, true);

      couponGrid.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLImageElement)) return;
        if (!target.matches('[data-coupon-image="true"]')) return;
        if(couponImageViewer && couponImageTarget) {
          couponImageTarget.src = target.src;
          couponImageViewer.classList.add('active');
        }
      });
    }
    if(couponImageViewer) {
      couponImageViewer.addEventListener('click', () => {
        couponImageViewer.classList.remove('active');
      });
    }
    
  } catch (err) {
    console.warn("모달 초기화 중 에러 발생:", err);
  }
});

