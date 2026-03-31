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

          alert("입장 대기 신청이 완료되었습니다! 검토 후 연락드리겠습니다.");
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
    // 맨 위로 가기 버튼 제어
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
          scrollToTopBtn.classList.add('visible');
        } else {
          scrollToTopBtn.classList.remove('visible');
        }
      });

      scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  } catch (err) {
    console.warn("모달 초기화 중 에러 발생:", err);
  }
});
