// DOM 요소들
const themeToggle = document.getElementById('themeToggle');
const copyEmailBtn = document.getElementById('copyEmailBtn');
const submitIdea = document.getElementById('submitIdea');
const ideaInput = document.getElementById('ideaInput');
const ideaName = document.getElementById('ideaName');
const ideaContact = document.getElementById('ideaContact');
const anonymousCheck = document.getElementById('anonymousCheck');
const nameGroup = document.getElementById('nameGroup');
const contactGroup = document.getElementById('contactGroup');
const toastContainer = document.getElementById('toastContainer');

// Canvas 연결선
const connectionCanvas = document.getElementById('connectionCanvas');
const ctx = connectionCanvas.getContext('2d');

// EmailJS 초기화
emailjs.init("YOUR_USER_ID"); // 실제 EmailJS User ID로 교체 필요

// 테마 관리
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.className = savedTheme === 'dark' ? 'dark-mode' : 'light-mode';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', newTheme);
    
    // Three.js 배경 효과 업데이트
    updateThreeBackground(newTheme);
}

// Canvas 연결선 초기화
function initConnectionCanvas() {
    function resizeCanvas() {
        connectionCanvas.width = window.innerWidth;
        connectionCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// 연결선 그리기
function drawConnections() {
    const activeSection = getActiveSection();
    if (!activeSection) return;
    
    ctx.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);
    ctx.strokeStyle = 'rgba(39, 174, 96, 0.3)';
    ctx.lineWidth = 1;
    
    const dots = document.querySelectorAll('.dot');
    const activeDots = Array.from(dots).filter(dot => 
        dot.dataset.section === activeSection || 
        dot.dataset.section === 'hero'
    );
    
    // 활성 섹션의 점들을 연결
    for (let i = 0; i < activeDots.length - 1; i++) {
        const dot1 = activeDots[i];
        const dot2 = activeDots[i + 1];
        
        const rect1 = dot1.getBoundingClientRect();
        const rect2 = dot2.getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

function hideConnections() {
    ctx.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);
}

// 현재 활성 섹션 찾기
function getActiveSection() {
    const sections = ['hero', 'about', 'experiences', 'skills', 'idea', 'contact'];
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;
            
            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                return sectionId;
            }
        }
    }
    return null;
}

// Three.js 배경 효과
let scene, camera, renderer, particles, shootingStars;
let isDarkMode = false;

function initThreeBackground() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    const container = document.getElementById('threeBackground');
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // 파티클 생성
    createParticles();
    
    camera.position.z = 5;
    animate();
    
    // 윈도우 리사이즈 이벤트
    window.addEventListener('resize', onWindowResize);
}

function createParticles() {
    // 초록색 파티클 완전 제거
    particles = null;
}

function createConnectionLines() {
    if (window.connectionLines) {
        scene.remove(window.connectionLines);
    }
    
    const group = new THREE.Group();
    const lineCount = 80; // 연결선 수 더 증가
    
    for (let i = 0; i < lineCount; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        
        // 시작점과 끝점
        const startX = (Math.random() - 0.5) * 70;
        const startY = (Math.random() - 0.5) * 70;
        const startZ = (Math.random() - 0.5) * 70;
        
        const endX = startX + (Math.random() - 0.5) * 25;
        const endY = startY + (Math.random() - 0.5) * 25;
        const endZ = startZ + (Math.random() - 0.5) * 25;
        
        positions.push(startX, startY, startZ, endX, endY, endZ);
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.4,
            linewidth: 1
        });
        
        const line = new THREE.Line(geometry, material);
        group.add(line);
    }
    
    window.connectionLines = group;
    scene.add(group);
}

function createShootingStars() {
    if (shootingStars) {
        scene.remove(shootingStars);
    }
    
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    const starCount = 30; // 별똥별 수 대폭 증가
    
    for (let i = 0; i < starCount; i++) {
        // 별똥별 시작점
        positions.push(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
        
        // 흰색 별
        colors.push(1, 1, 1);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.12, // 더 큰 별
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });
    
    shootingStars = new THREE.Points(geometry, material);
    shootingStars.userData.velocities = [];
    
    // 별똥별 속도 설정 (더 역동적으로)
    for (let i = 0; i < starCount; i++) {
        shootingStars.userData.velocities.push({
            x: (Math.random() - 0.5) * 0.15,
            y: (Math.random() - 0.5) * 0.15,
            z: (Math.random() - 0.5) * 0.15
        });
    }
    
    scene.add(shootingStars);
}

function createOrbitalPaths() {
    if (window.orbitalPaths) {
        scene.remove(window.orbitalPaths);
    }
    
    const group = new THREE.Group();
    
    // 여러 궤도 생성
    for (let i = 0; i < 12; i++) { // 궤도 수 증가
        const radius = 15 + i * 4;
        const segments = 64;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.3; // 타원형 궤도
            const z = (Math.random() - 0.5) * 15;
            positions.push(x, y, z);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: 0x4f46e5,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });
        
        const line = new THREE.Line(geometry, material);
        line.rotation.x = Math.PI / 2;
        line.rotation.z = Math.random() * Math.PI * 2;
        group.add(line);
    }
    
    window.orbitalPaths = group;
    scene.add(group);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (particles && !isDarkMode) {
        // 파티클 회전 (더 빠르게)
        particles.rotation.x += 0.0008; // 속도 증가
        particles.rotation.y += 0.0015; // 속도 증가
        
        // 개별 파티클 움직임 (더 빠르게)
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.userData.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i / 3][0];
            positions[i + 1] += velocities[i / 3][1];
            positions[i + 2] += velocities[i / 3][2];
            
            // 경계 체크 및 재배치 (더 자연스럽게)
            if (Math.abs(positions[i]) > 35) {
                positions[i] = (Math.random() - 0.5) * 70;
            }
            if (Math.abs(positions[i + 1]) > 35) {
                positions[i + 1] = (Math.random() - 0.5) * 70;
            }
            if (Math.abs(positions[i + 2]) > 35) {
                positions[i + 2] = (Math.random() - 0.5) * 70;
            }
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    if (shootingStars && isDarkMode) {
        // 별똥별 움직임 (더 빠르게)
        const positions = shootingStars.geometry.attributes.position.array;
        const velocities = shootingStars.userData.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i / 3].x;
            positions[i + 1] += velocities[i / 3].y;
            positions[i + 2] += velocities[i / 3].z;
            
            // 경계 체크 및 재배치
            if (Math.abs(positions[i]) > 40 || Math.abs(positions[i + 1]) > 40 || Math.abs(positions[i + 2]) > 40) {
                positions[i] = (Math.random() - 0.5) * 80;
                positions[i + 1] = (Math.random() - 0.5) * 80;
                positions[i + 2] = (Math.random() - 0.5) * 80;
            }
        }
        
        shootingStars.geometry.attributes.position.needsUpdate = true;
    }
    
    // 궤도 회전 (더 빠르게)
    if (window.orbitalPaths && isDarkMode) {
        window.orbitalPaths.rotation.y += 0.002; // 속도 증가
        window.orbitalPaths.rotation.z += 0.001; // 속도 증가
    }
    
    renderer.render(scene, camera);
}

function updateThreeBackground(theme) {
    isDarkMode = theme === 'dark';
    
    if (particles && particles.material) {
        if (isDarkMode) {
            // 다크모드: 초록색 점 완전 제거, 흰색 별들만
            particles.visible = false;
            
            // 별똥별 생성
            createShootingStars();
            
            // 궤도 경로 생성
            createOrbitalPaths();
        } else {
            // 라이트모드: 따뜻한 초록색 점들 (햇살 비치는 녹색 혁신)
            particles.visible = true;
            particles.material.color.setHex(0x059669);
            particles.material.opacity = 0.9;
            particles.material.size = 0.03;
            particles.material.blending = THREE.AdditiveBlending;
            
            // 연결선 생성
            createConnectionLines();
            
            // 별똥별 제거
            if (shootingStars) {
                scene.remove(shootingStars);
                shootingStars = null;
            }
            
            // 궤도 경로 제거
            if (window.orbitalPaths) {
                scene.remove(window.orbitalPaths);
                window.orbitalPaths = null;
            }
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 이메일 복사
async function copyEmailFunc() {
    const email = 'percabeth04@naver.com';
    
    try {
        await navigator.clipboard.writeText(email);
        showToast('이메일이 복사되었습니다!', 'success');
    } catch (err) {
        showToast('복사에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// 익명 체크박스 처리
function handleAnonymousToggle() {
    if (anonymousCheck.checked) {
        // 익명 체크 시 이름과 연락처 입력란 숨기기
        nameGroup.classList.add('hidden');
        contactGroup.classList.add('hidden');
        
        // 입력값 초기화
        ideaName.value = '';
        ideaContact.value = '';
    } else {
        // 익명 해제 시 이름과 연락처 입력란 보이기
        nameGroup.classList.remove('hidden');
        contactGroup.classList.remove('hidden');
    }
}

// 아이디어 제출
async function submitIdeaFunc() {
    const name = ideaName.value.trim();
    const contact = ideaContact.value.trim();
    const idea = ideaInput.value.trim();
    const isAnonymous = anonymousCheck.checked;
    
    if (!idea) {
        showToast('아이디어나 피드백을 입력해주세요.', 'error');
        return;
    }
    
    // EmailJS를 사용한 이메일 전송
    const templateParams = {
        from_name: isAnonymous ? '익명' : (name || '이름 없음'),
        from_contact: contact || '연락처 없음',
        message: idea,
        to_email: 'percabeth04@naver.com'
    };
    
    try {
        await emailjs.send(
            'YOUR_SERVICE_ID', // 실제 EmailJS Service ID로 교체 필요
            'YOUR_TEMPLATE_ID', // 실제 EmailJS Template ID로 교체 필요
            templateParams
        );
        
        showToast('메시지가 전달되었어요! 감사합니다 ✨', 'success');
        
        // 폼 초기화
        ideaName.value = '';
        ideaContact.value = '';
        ideaInput.value = '';
        anonymousCheck.checked = false;
        
        // 입력란 다시 보이기
        nameGroup.classList.remove('hidden');
        contactGroup.classList.remove('hidden');
        
        // localStorage에 저장
        const ideaData = {
            timestamp: new Date().toISOString(),
            name: isAnonymous ? '익명' : (name || '이름 없음'),
            contact: contact || '연락처 없음',
            idea: idea
        };
        
        const savedIdeas = JSON.parse(localStorage.getItem('ideas') || '[]');
        savedIdeas.push(ideaData);
        localStorage.setItem('ideas', JSON.stringify(savedIdeas));
        
    } catch (error) {
        console.error('EmailJS Error:', error);
        showToast('전송에 실패했어요. 다시 시도해주세요.', 'error');
    }
}

// 토스트 메시지
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 스크롤 애니메이션
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // 연결선 그리기
                drawConnections();
            }
        });
    }, observerOptions);
    
    // 모든 섹션 관찰
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// 이벤트 리스너 등록
function initEventListeners() {
    // 테마 토글
    themeToggle.addEventListener('click', toggleTheme);
    
    // 이메일 복사
    copyEmailBtn.addEventListener('click', copyEmailFunc);
    
    // 아이디어 제출
    submitIdea.addEventListener('click', submitIdeaFunc);
    
    // 익명 체크박스
    anonymousCheck.addEventListener('change', handleAnonymousToggle);
    
    // 스크롤 이벤트
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const activeSection = getActiveSection();
            
            // 점 활성화 상태 업데이트
            document.querySelectorAll('.dot').forEach(dot => {
                dot.classList.remove('active');
            });
            
            if (activeSection) {
                const activeDot = document.querySelector(`[data-section="${activeSection}"]`);
                if (activeDot) {
                    activeDot.classList.add('active');
                }
            }
        }, 100);
    });
}

// 자동 스크롤 관리
let autoScrollEnabled = true;
let autoScrollSpeed = 30; // 초 단위

function initAutoScroll() {
    // 모바일에서는 자동 스크롤 완전 비활성화
    if (window.innerWidth <= 768) {
        autoScrollEnabled = false;
        stopAutoScroll();
        return;
    }
    
    startAutoScroll();
    
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            stopAutoScroll();
            autoScrollEnabled = false;
        } else {
            if (!autoScrollEnabled) {
                autoScrollEnabled = true;
                startAutoScroll();
            }
        }
    });
}

function startAutoScroll() {
    if (!autoScrollEnabled) return;
    
    const experiencesGrid = document.querySelector('.experiences-grid');
    const skillsGrid = document.querySelector('.skills-grid');
    
    if (experiencesGrid) {
        experiencesGrid.style.animation = `autoScroll ${autoScrollSpeed}s linear infinite`;
    }
    
    if (skillsGrid) {
        skillsGrid.style.animation = `autoScroll ${autoScrollSpeed - 5}s linear infinite`;
    }
}

function stopAutoScroll() {
    const experiencesGrid = document.querySelector('.experiences-grid');
    const skillsGrid = document.querySelector('.skills-grid');
    
    if (experiencesGrid) {
        experiencesGrid.style.animation = 'none';
    }
    
    if (skillsGrid) {
        skillsGrid.style.animation = 'none';
    }
}

// 파티클 시스템
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particlesContainer');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: 0, y: 0 };
        this.settings = {
            count: 50,
            size: 4,
            speed: 1,
            connectionDistance: 100,
            theme: '#059669',
            autoGenerate: true
        };
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.bindEvents();
        this.animate();
        this.updateSettings();
    }
    
    createParticles() {
        this.container.innerHTML = '';
        this.particles = [];
        
        for (let i = 0; i < this.settings.count; i++) {
            const particle = this.createParticle();
            this.particles.push(particle);
            this.container.appendChild(particle);
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        particle.style.width = this.settings.size + 'px';
        particle.style.height = this.settings.size + 'px';
        particle.style.background = this.settings.theme;
        
        // 랜덤 애니메이션 지연
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        return particle;
    }
    
    bindEvents() {
        // 마우스 움직임 추적
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.followMouse();
        });
        
        // 클릭 시 폭발 효과
        document.addEventListener('click', (e) => {
            this.createExplosion(e.clientX, e.clientY);
        });
        
        // 터치 이벤트 (모바일)
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.mouse.x = touch.clientX;
            this.mouse.y = touch.clientY;
            this.followMouse();
        });
        
        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.mouse.x = touch.clientX;
            this.mouse.y = touch.clientY;
            this.followMouse();
        });
    }
    
    followMouse() {
        // 마우스 근처의 파티클들을 끌어당기기
        this.particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const dx = this.mouse.x - (rect.left + rect.width / 2);
            const dy = this.mouse.y - (rect.top + rect.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                const moveX = dx * force * 0.02 * this.settings.speed;
                const moveY = dy * force * 0.02 * this.settings.speed;
                
                const currentLeft = parseFloat(particle.style.left) + moveX;
                const currentTop = parseFloat(particle.style.top) + moveY;
                
                particle.style.left = currentLeft + 'px';
                particle.style.top = currentTop + 'px';
            }
        });
    }
    
    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = x + 'px';
        explosion.style.top = y + 'px';
        
        // 폭발 파티클 생성
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const explodeX = Math.cos(angle) * distance;
            const explodeY = Math.sin(angle) * distance;
            
            const explosionParticle = document.createElement('div');
            explosionParticle.className = 'explosion-particle';
            explosionParticle.style.setProperty('--explode-x', explodeX + 'px');
            explosionParticle.style.setProperty('--explode-y', explodeY + 'px');
            explosionParticle.style.background = this.settings.theme;
            
            explosion.appendChild(explosionParticle);
        }
        
        document.body.appendChild(explosion);
        
        // 애니메이션 완료 후 제거
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 800);
    }
    
    drawConnections() {
        // 기존 연결선 제거
        this.connections.forEach(connection => {
            if (connection.parentNode) {
                connection.parentNode.removeChild(connection);
            }
        });
        this.connections = [];
        
        // 새로운 연결선 그리기
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle1 = this.particles[i];
                const particle2 = this.particles[j];
                
                const rect1 = particle1.getBoundingClientRect();
                const rect2 = particle2.getBoundingClientRect();
                
                const x1 = rect1.left + rect1.width / 2;
                const y1 = rect1.top + rect1.height / 2;
                const x2 = rect2.left + rect2.width / 2;
                const y2 = rect2.top + rect2.height / 2;
                
                const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                
                if (distance < this.settings.connectionDistance) {
                    const connection = document.createElement('div');
                    connection.className = 'particle-connection';
                    connection.style.left = x1 + 'px';
                    connection.style.top = y1 + 'px';
                    connection.style.width = distance + 'px';
                    connection.style.background = `linear-gradient(90deg, transparent, ${this.settings.theme}, transparent)`;
                    
                    const angle = Math.atan2(y2 - y1, x2 - x1);
                    connection.style.transform = `rotate(${angle}rad)`;
                    
                    this.container.appendChild(connection);
                    this.connections.push(connection);
                }
            }
        }
    }
    
    animate() {
        // 연결선 그리기
        this.drawConnections();
        
        // 자동 파티클 생성
        if (this.settings.autoGenerate && Math.random() < 0.02) {
            this.createRandomParticle();
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    createRandomParticle() {
        if (this.particles.length < this.settings.count * 1.5) {
            const particle = this.createParticle();
            this.particles.push(particle);
            this.container.appendChild(particle);
            
            // 일정 시간 후 제거
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                    this.particles = this.particles.filter(p => p !== particle);
                }
            }, 10000);
        }
    }
    
    updateSettings() {
        // 설정값 업데이트
        document.getElementById('particleCount').addEventListener('input', (e) => {
            this.settings.count = parseInt(e.target.value);
            document.getElementById('particleCountValue').textContent = this.settings.count;
            this.createParticles();
        });
        
        document.getElementById('particleSize').addEventListener('input', (e) => {
            this.settings.size = parseFloat(e.target.value);
            document.getElementById('particleSizeValue').textContent = this.settings.size;
            this.particles.forEach(particle => {
                particle.style.width = this.settings.size + 'px';
                particle.style.height = this.settings.size + 'px';
            });
        });
        
        document.getElementById('particleSpeed').addEventListener('input', (e) => {
            this.settings.speed = parseFloat(e.target.value);
            document.getElementById('particleSpeedValue').textContent = this.settings.speed;
        });
        
        document.getElementById('connectionDistance').addEventListener('input', (e) => {
            this.settings.connectionDistance = parseInt(e.target.value);
            document.getElementById('connectionDistanceValue').textContent = this.settings.connectionDistance;
        });
        
        // 테마 색상 변경
        const themeInputs = ['themeGreen', 'themeBlue', 'themePurple', 'themePink'];
        themeInputs.forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.particles.forEach(particle => {
                    particle.style.background = this.settings.theme;
                });
            });
        });
        
        // 자동 생성 토글
        document.getElementById('autoGenerate').addEventListener('change', (e) => {
            this.settings.autoGenerate = e.target.checked;
        });
    }
}

// 파티클 설정 패널 토글
function initParticleSettings() {
    const toggle = document.getElementById('particleToggle');
    const settings = document.getElementById('particleSettings');
    
    toggle.addEventListener('click', () => {
        settings.classList.toggle('show');
    });
    
    // 설정 패널 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        if (!settings.contains(e.target) && !toggle.contains(e.target)) {
            settings.classList.remove('show');
        }
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initConnectionCanvas();
    initThreeBackground();
    initScrollAnimations();
    initEventListeners();
    initAutoScroll(); // 자동 스크롤 초기화 추가
    
    // 파티클 시스템 초기화
    const particleSystem = new ParticleSystem();
    initParticleSettings();
    
    // 첫 번째 섹션 활성화
    setTimeout(() => {
        const heroDot = document.querySelector('[data-section="hero"]');
        if (heroDot) {
            heroDot.classList.add('active');
        }
    }, 500);
    
    console.log('🎯 Vibe Me - Connecting the dots 전자명함이 로드되었습니다!');
    console.log('✨ 파티클 시스템이 활성화되었습니다!');
});

// 성능 최적화를 위한 스로틀링
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 리사이즈 이벤트 스로틀링
window.addEventListener('resize', throttle(() => {
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}, 100));
