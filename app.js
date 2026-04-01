document.addEventListener('DOMContentLoaded', () => {
  // 모달 제어 요소를 안전하게 가져오기 (try-catch로 전체 감싸기)
  try {
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

        // 1. Supabase 연동 변수 (본인 키로 변경 필요)
        const SUPABASE_URL = 'https://fsbwzgumzkhplotgqpmr.supabase.co'; 
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzYnd6Z3VtemtocGxvdGdxcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MjUyODcsImV4cCI6MjA5MDUwMTI4N30.mLOXdxtWFpIuDPtk5AF2jLnX4AA2tVId95KIyFAQoO4'; 

        // 2. 동의 체크 확인
        const consent = document.getElementById('consent');
        if (consent && !consent.checked) {
          alert("개인정보 수집 및 이용에 동의해주세요.");
          return;
        }

        // 3. Supabase 클라이언트 지연(Lazy) 연동 시도
        let supabaseClient = null;
        try {
          if (!window.supabase) throw new Error("Supabase CDN이 로드되지 않았습니다.");
          supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (error) {
          alert('데이터베이스(Supabase) 설정이 완료되지 않았습니다.\napp.js 파일에 본인의 URL과 KEY를 입력해주세요!');
          return;
        }

        // 4. 입력 데이터 수집
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
        if (scrolled && !isNoticeClosed) scrollNotice.classList.add('visible');
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
    let isLoggedIn = false;
    
    const loginModal = document.getElementById('loginModal');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const loginForm = document.getElementById('loginForm');
    
    const tabs = document.querySelectorAll('.nav-tabs .tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const homeActions = document.getElementById('homeActions');

    // 로그인 모달 닫기
    const closeLoginModal = () => {
      if (loginModal) loginModal.classList.remove('active');
    };

    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLoginModal);
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
      });
    }

    // 로그인 폼 제출 (단순 가짜 로그인 처리)
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const userPw = document.getElementById('userPw').value;
        
        if (userId && userPw) {
          // 임시 하드코딩된 인증 성공 처리 (실제로는 서버 연동 필요)
          isLoggedIn = true;
          alert('로그인되었습니다. 환영합니다 사장님!');
          
          // 유저 이름 업데이트 (마이페이지 등)
          const displayUserId = document.getElementById('displayUserId');
          if (displayUserId) displayUserId.textContent = userId + ' 사장님';

          closeLoginModal();
          // 로그인 성공 후 커뮤니티 탭으로 바로 이동
          switchTab('tab-community');
        } else {
          alert('아이디와 비밀번호를 모두 입력해주세요.');
        }
      });
    }

    // 탭 전환 함수
    const switchTab = (targetId) => {
      // 권한 체크
      if (targetId !== 'tab-home' && !isLoggedIn) {
        if (loginModal) loginModal.classList.add('active');
        return;
      }

      // UI 업데이트
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelector(`[data-tab="${targetId}"]`).classList.add('active');

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
      window.scrollTo(0, 0);
    };

    // 탭 클릭 이벤트
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = tab.getAttribute('data-tab');
        switchTab(targetId);
      });
    });

    // --- 신규 기능: 데일리 미션 (체크리스트) 상태 관리 로직 ---
    const missionPool = [
      { id: 'm1', tagClass: 'tag-green', tagText: '위생', text: '오늘 유통기한 지난 재료 하나도 없이 오픈했다' },
      { id: 'm2', tagClass: 'tag-purple', tagText: '운영', text: '오픈 30분 전에 매장에 도착했다' },
      { id: 'm3', tagClass: 'tag-orange', tagText: '서비스', text: '오늘 첫 손님한테 먼저 인사했다' },
      { id: 'm4', tagClass: 'tag-blue', tagText: '청결', text: '손님이 기다리는 동안 빈 테이블을 치웠다' },
      { id: 'm5', tagClass: 'tag-red', tagText: '리뷰', text: '배달앱 리뷰에 답글을 하나 이상 달았다' },
      { id: 'm6', tagClass: 'tag-blue', tagText: '매출', text: '오늘 매출을 어제/지난주 같은 요일과 비교해봤다' },
      { id: 'm7', tagClass: 'tag-blue', tagText: '매출', text: '오늘 가장 많이 팔린 메뉴와 안 팔린 메뉴를 확인했다' },
      { id: 'm8', tagClass: 'tag-purple', tagText: 'SNS', text: '오늘 네이버 플레이스나 SNS에 사진 하나 올렸다' },
      { id: 'm9', tagClass: 'tag-green', tagText: '루틴', text: '오늘 퇴근 전에 내일 오픈 준비를 미리 해뒀다' },
      { id: 'm10', tagClass: 'tag-mint', tagText: '멘탈', text: '오늘 매장 외에 나를 위한 시간을 30분이라도 가졌다' },
      { id: 'm11', tagClass: 'tag-mint', tagText: '멘탈', text: '오늘 하루 잘한 것 하나를 스스로 인정했다' },
      { id: 'm12', tagClass: 'tag-green', tagText: '루틴', text: '오늘 매장 운영 중 개선할 점 하나를 메모해 뒀다' },
    ];

    let selectedMissionIds = [];
    
    const missionSelectState = document.getElementById('missionSelectState');
    const missionActiveState = document.getElementById('missionActiveState');
    const activeMissionList = document.getElementById('activeMissionList');
    const missionPickerList = document.getElementById('missionPickerList');
    
    const missionModal = document.getElementById('missionModal');
    const btnOpenMissionModal = document.getElementById('btnOpenMissionModal');
    const closeMissionBtn = document.getElementById('closeMissionBtn');
    const saveMissionBtn = document.getElementById('saveMissionBtn');
    const btnEditMissions = document.getElementById('btnEditMissions');
    
    const missionCountSpan = document.getElementById('missionCount');
    const missionTotalSpan = document.getElementById('missionTotal');
    const missionProgress = document.getElementById('missionProgress');
    
    // 모달 렌더링
    if (missionPickerList) {
      missionPickerList.innerHTML = missionPool.map(m => `
        <label class="mission-item">
          <input type="checkbox" class="mission-checkbox picker-checkbox" value="${m.id}" style="margin-top: 4px;">
          <div class="mission-content">
            <span class="tag ${m.tagClass}">${m.tagText}</span>
            <span class="mission-text">${m.text}</span>
          </div>
        </label>
      `).join('');
    }

    const openMissionModal = () => {
      // 기존 선택 항목 체크 적용
      const pickers = document.querySelectorAll('.picker-checkbox');
      pickers.forEach(chk => {
        chk.checked = selectedMissionIds.includes(chk.value);
      });
      if (missionModal) missionModal.classList.add('active');
    };

    const closeMissionModalObj = () => {
      if (missionModal) missionModal.classList.remove('active');
    };

    if (btnOpenMissionModal) btnOpenMissionModal.addEventListener('click', openMissionModal);
    if (btnEditMissions) btnEditMissions.addEventListener('click', openMissionModal);
    if (closeMissionBtn) closeMissionBtn.addEventListener('click', closeMissionModalObj);
    if (missionModal) {
      missionModal.addEventListener('click', (e) => {
        if (e.target === missionModal) closeMissionModalObj();
      });
    }

    if (saveMissionBtn) {
      saveMissionBtn.addEventListener('click', () => {
        const pickers = document.querySelectorAll('.picker-checkbox:checked');
        selectedMissionIds = Array.from(pickers).map(chk => chk.value);
        
        if (selectedMissionIds.length < 3 || selectedMissionIds.length > 7) {
          alert('미션을 3개에서 7개 사이로 선택해주세요.');
          return;
        }
        
        renderActiveMissions();
        closeMissionModalObj();
      });
    }

    const renderActiveMissions = () => {
      if (selectedMissionIds.length === 0) {
        if(missionSelectState) missionSelectState.style.display = 'block';
        if(missionActiveState) missionActiveState.style.display = 'none';
      } else {
        if(missionSelectState) missionSelectState.style.display = 'none';
        if(missionActiveState) missionActiveState.style.display = 'block';
        
        if(missionTotalSpan) missionTotalSpan.textContent = selectedMissionIds.length;
        
        const activeItems = missionPool.filter(m => selectedMissionIds.includes(m.id));
        activeMissionList.innerHTML = activeItems.map(m => `
          <label class="mission-item">
            <input type="checkbox" class="mission-checkbox active-checkbox" style="margin-top: 4px;">
            <div class="mission-content">
              <span class="tag ${m.tagClass}">${m.tagText}</span>
              <span class="mission-text">${m.text}</span>
            </div>
          </label>
        `).join('');

        // 이벤트 재연결
        const newlyAdded = document.querySelectorAll('.active-checkbox');
        newlyAdded.forEach(chk => {
          chk.addEventListener('change', updateMissionProgress);
        });
        
        updateMissionProgress();
      }
    };

    const updateMissionProgress = () => {
      const activeCheckboxes = document.querySelectorAll('.active-checkbox');
      let checkedCount = 0;
      activeCheckboxes.forEach(chk => {
        const item = chk.closest('.mission-item');
        if (chk.checked) {
          checkedCount++;
          if (item) item.classList.add('completed');
        } else {
          if (item) item.classList.remove('completed');
        }
      });

      if (missionCountSpan) missionCountSpan.textContent = checkedCount;
      if (missionProgress) {
        const total = selectedMissionIds.length || 1;
        const pct = (checkedCount / total) * 100;
        missionProgress.style.width = pct + '%';
      }
    };

    // --- 피드 (게시판) 상호작용 및 글쓰기 로직 ---
    const feedCards = document.querySelectorAll('.feed-card');
    feedCards.forEach(card => {
      const btnLike = card.querySelector('.btn-like');
      const btnCommentToggle = card.querySelector('.btn-comment');
      const feedCommentsArea = card.querySelector('.feed-comments');
      
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
          const isActived = btnLike.classList.contains('active');
          
          if(isActived) {
            btnLike.classList.remove('active');
            btnLike.querySelector('.icon').textContent = '🤍';
            if(countSpan) countSpan.textContent = parseInt(countSpan.textContent) - 1;
          } else {
            btnLike.classList.add('active');
            btnLike.querySelector('.icon').textContent = '❤️';
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
            const input = feedCommentsArea.querySelector('.comment-input');
            if(input) input.focus();
          } else {
            feedCommentsArea.style.display = 'none';
          }
        });
      }
    });

    // 글쓰기 모달 제어 (액션 시트 연결)
    const writeActionSheet = document.getElementById('writeActionSheet');
    const writeModal = document.getElementById('writeModal');
    const closeWriteBtn = document.getElementById('closeWriteBtn');
    const cancelWriteBtn = document.getElementById('cancelWriteBtn');
    
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
      submitWriteBtn.addEventListener('click', () => {
        const content = document.getElementById('postContent').value;
        if (!content.trim()) {
          alert('내용을 입력해주세요.');
          return;
        }
        alert('소중한 글이 자유게시판에 등록되었습니다.');
        document.getElementById('postContent').value = '';
        closeWriteModal();
      });
    }

    // --- 실전 템플릿 서브페이지 로직 ---
    const btnTemplate = document.getElementById('btnTemplate');
    const templatePage = document.getElementById('templatePage');
    const closeTemplateBtn = document.getElementById('closeTemplateBtn');
    const templateDoneBtn = document.getElementById('templateDoneBtn');

    if (btnTemplate) {
      btnTemplate.addEventListener('click', () => {
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
    if (templateDoneBtn) templateDoneBtn.addEventListener('click', closeTemplateView);

    
    // 초기 로드 시 탭 셋업
    if (homeActions) homeActions.style.display = 'flex'; // 초기 상태

    // --- 4차 피드백: 자유/회고 게시판 탭 전환 로직 ---
    const boardTabs = document.querySelectorAll('.board-tab');
    const boardPanes = document.querySelectorAll('.board-pane');
    boardTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        boardTabs.forEach(t => t.classList.remove('active'));
        boardPanes.forEach(p => p.style.display = 'none');
        tab.classList.add('active');
        const targetId = tab.getAttribute('data-board');
        if(document.getElementById(targetId)) document.getElementById(targetId).style.display = 'block';
      });
    });

    // --- 4차 피드백: 미션 추천(랜덤) 로직 ---
    const btnRandomMission = document.getElementById('btnRandomMission');
    if(btnRandomMission) {
      btnRandomMission.addEventListener('click', () => {
        if (!isLoggedIn) {
          if (loginModal) loginModal.classList.add('active');
          return;
        }
        const checkboxes = document.querySelectorAll('.mission-picker-item input[type="checkbox"]');
        if(checkboxes.length === 0) return;
        checkboxes.forEach(cb => cb.checked = false);
        let arr = Array.from(checkboxes);
        arr.sort(() => Math.random() - 0.5);
        for(let i=0; i<3; i++) {
          arr[i].checked = true;
        }
        document.getElementById('saveMissionBtn').click(); // 기존 저장 버튼 트리거
      });
    }

    // --- 4차 피드백: 글쓰기 액션시트 및 모달 내부 탭 제어 ---
    const btnCancelActionSheet = document.getElementById('btnCancelActionSheet');
    const btnWriteFree = document.getElementById('btnWriteFree');
    const btnWriteRetro = document.getElementById('btnWriteRetro');
    
    const typeFreeBtn = document.getElementById('typeFreeBtn');
    const typeRetroBtn = document.getElementById('typeRetroBtn');
    const retroMissionsContainer = document.getElementById('retroMissionsContainer');
    const myRetroTags = document.getElementById('myRetroTags');
    const writeModalTitle = document.getElementById('writeModalTitle');
    const postContent = document.getElementById('postContent');

    const closeActionSheet = () => { if(writeActionSheet) writeActionSheet.classList.remove('active'); };
    if(btnCancelActionSheet) btnCancelActionSheet.addEventListener('click', closeActionSheet);
    if(writeActionSheet) writeActionSheet.addEventListener('click', (e) => { if (e.target === writeActionSheet) closeActionSheet(); });

    const openWriteModalAs = (isRetro) => {
      closeActionSheet();
      postContent.value = '';
      if(isRetro) {
        typeFreeBtn.classList.remove('active');
        typeRetroBtn.classList.add('active');
        retroMissionsContainer.style.display = 'block';
        writeModalTitle.textContent = '회고 글쓰기';
        
        // Populate retro tags
        const completedItems = document.querySelectorAll('.mission-item.completed .mission-text');
        myRetroTags.innerHTML = '';
        if(completedItems.length > 0) {
          completedItems.forEach(item => {
            myRetroTags.innerHTML += `<div>✔️ ${item.textContent}</div>`;
          });
        } else {
          myRetroTags.innerHTML = '<span style="color:var(--text-muted)">아직 완료한 미션이 없습니다. (미션 없이도 작성은 가능합니다.)</span>';
        }
      } else {
        typeRetroBtn.classList.remove('active');
        typeFreeBtn.classList.add('active');
        retroMissionsContainer.style.display = 'none';
        writeModalTitle.textContent = '자유 게시판 글쓰기';
      }
      writeModal.classList.add('active');
    };

    if(btnWriteFree) btnWriteFree.addEventListener('click', () => openWriteModalAs(false));
    if(btnWriteRetro) btnWriteRetro.addEventListener('click', () => openWriteModalAs(true));

    const confirmTypeSwitch = (isRetro) => {
      if(postContent.value.trim() !== '') {
        if(!confirm("작성 중인 내용이 사라집니다. 게시글 종류를 변경하시겠습니까?")) return;
      }
      openWriteModalAs(isRetro);
    };

    if(typeFreeBtn) typeFreeBtn.addEventListener('click', () => {
      if(!typeFreeBtn.classList.contains('active')) confirmTypeSwitch(false);
    });
    if(typeRetroBtn) typeRetroBtn.addEventListener('click', () => {
      if(!typeRetroBtn.classList.contains('active')) confirmTypeSwitch(true);
    });

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
        if(rewardInfoModal) {
          rewardInfoDesc.innerHTML = `<strong style="font-size:16px;">[${title}]</strong><br><br>현재 달성 상태: <span style="color:var(--primary); font-weight:bold;">${status}</span><br><br>이벤트 조건을 만족하시면 리워드함에 쿠폰이 자동으로 발급됩니다.`;
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
    document.querySelectorAll('.coupon-card img').forEach(img => {
      img.addEventListener('click', () => {
        if(couponImageViewer && couponImageTarget) {
          couponImageTarget.src = img.src;
          couponImageViewer.classList.add('active');
        }
      });
    });
    if(couponImageViewer) {
      couponImageViewer.addEventListener('click', () => {
        couponImageViewer.classList.remove('active');
      });
    }
    
  } catch (err) {
    console.warn("모달 초기화 중 에러 발생:", err);
  }
});
