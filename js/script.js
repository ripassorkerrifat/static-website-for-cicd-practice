document.addEventListener('DOMContentLoaded', () => {
  // Initialize canvas particle background
  initParticleCanvas();

  // Initialize interactive mouse coordinates for glass cards
  initCardHoverGlows();

  // Initialize intersection observers for fade-in reveals and metrics counting
  initScrollObservers();

  // Initialize interactive CI/CD Pipeline logs viewer
  initPipelineViewer();

  // Initialize interactive AWS architecture diagram toggles
  initAwsArchToggler();

  // Initialize mobile menu toggle
  initMobileMenu();

  // Form submission terminal simulation
  initContactForm();
});

/* ==========================================================================
   1. Canvas Particle Background
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationFrameId;

  // Configuration
  const config = {
    particleCount: 55,
    maxDistance: 130,
    baseSpeed: 0.18,
    colors: ['#3B82F6', '#06B6D4', '#8B5CF6']
  };

  // Adjust size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * config.baseSpeed;
      this.speedY = (Math.random() - 0.5) * config.baseSpeed;
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
      this.alpha = Math.random() * 0.4 + 0.1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap-around bounds
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    const count = Math.min(config.particleCount, (canvas.width * canvas.height) / 22000);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.maxDistance) {
          const force = (config.maxDistance - dist) / config.maxDistance;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = force * 0.12;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawLines();
    animationFrameId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animate();
}

/* ==========================================================================
   2. Interactive Card Hover Glow (Spotlight Effect)
   ========================================================================== */
function initCardHoverGlows() {
  const cards = document.querySelectorAll('.interactive-glow-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   3. Scroll Observers (Reveals, Active Links, & Metrics Counters)
   ========================================================================== */
function initScrollObservers() {
  // Elements fade-in reveal
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target); // Reveal once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // Active section tracker for navigation links
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.45
  });

  sections.forEach(s => sectionObserver.observe(s));

  // Shrink/fade header on scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Numbers counter animator
  const metricsSection = document.getElementById('metrics');
  const numbers = document.querySelectorAll('.metric-number');
  let countersAnimated = false;

  const countUp = (element) => {
    const target = parseFloat(element.getAttribute('data-target'));
    const isDecimal = element.getAttribute('data-decimal') === 'true';
    const hasPlus = element.getAttribute('data-plus') === 'true';
    const duration = 2000; // 2 seconds
    let startTime = null;

    const animateNumber = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function outQuad
      const easedProgress = progress * (2 - progress);
      
      let currentValue = easedProgress * target;
      
      if (isDecimal) {
        element.textContent = currentValue.toFixed(2) + '%';
      } else {
        element.textContent = Math.floor(currentValue) + (hasPlus ? '+' : '');
      }

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        // Force exact final output
        if (isDecimal) {
          element.textContent = target.toFixed(2) + '%';
        } else {
          element.textContent = target + (hasPlus ? '+' : '');
        }
      }
    };

    requestAnimationFrame(animateNumber);
  };

  const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        numbers.forEach(num => countUp(num));
        countersAnimated = true;
        metricsObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  if (metricsSection) metricsObserver.observe(metricsSection);
}

/* ==========================================================================
   4. CI/CD Pipeline Interactive Logs
   ========================================================================== */
const PIPELINE_DATA = {
  developer: {
    title: 'Developer Commit',
    badge: 'STAGE 1: CODE TRIGGER',
    desc: 'Local modifications (IaC updates, static files, and scripts) are validated locally using pre-commit hooks and pushed to the remote repository, triggering modern webhook pipelines.',
    logs: `[INFO] git status
On branch main
Your branch is up to date with 'origin/main'.

[INFO] git add .
[INFO] git commit -m "feat: optimize deployment pipeline performance"
[INFO] git push origin main
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 8 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 480 bytes | 480.00 KiB/s, done.
To github.com:ripassorkerrifat/static-website-for-cicd-practice.git
   f3a2b1c..e5d6c7b  main -> main
[SUCCESS] Commit successfully pushed. Remote repo updated.`,
    cmd: 'git push origin main',
    action: 'Webhook triggered: POST /repos/ripassorkerrifat/static-website-for-cicd-practice/hooks'
  },
  github_repo: {
    title: 'GitHub Repository',
    badge: 'STAGE 2: WEBHOOK HANDLER',
    desc: 'Centralized Version Control System. Standardizes git workflow branch protection rules and acts as the source of truth. Sends immediate push payloads to automate downstream build workers.',
    logs: `[INFO] Webhook event received from GitHub.
[INFO] Headers: X-GitHub-Event: push, X-Hub-Signature-256: sha256=9b7c...
[INFO] Payload parsed: Repository 'static-website-for-cicd-practice', branch 'main'.
[INFO] Comparing commits: f3a2b1c8f -> e5d6c7b2a
[INFO] Triggering workflow: .github/workflows/deploy.yml
[INFO] Job queue allocated. Runner ID assigned: GHA-RUN-992
[SUCCESS] Pipeline runner initialized and ready.`,
    cmd: 'webhook.trigger()',
    action: 'Status: 202 Accepted -> Dispatching runner GHA-RUN-992'
  },
  github_actions: {
    title: 'GitHub Actions',
    badge: 'STAGE 3: ORCHESTRATION',
    desc: 'The orchestrator spins up isolated Docker containers/runners (ubuntu-latest), sets up environment secrets (AWS IAM roles), configures caching, and monitors runner logs.',
    logs: `[INFO] Job run started: "Static Website Pipeline #254"
[INFO] Pulling Docker template container: ubuntu-latest...
[INFO] Preparing environment variables and OIDC credentials...
[INFO] Fetching action tools: actions/checkout@v4, aws-actions/configure-aws-credentials@v4
[INFO] Successfully authorized runner environment using OpenID Connect (OIDC)
[INFO] AWS IAM Role assumed: arn:aws:iam::123456789012:role/GitHubActionsS3DeployRole
[SUCCESS] Worker runner active. Initiating jobs sequentially.`,
    cmd: 'jobs.setup_runner()',
    action: 'Status: Runner Active'
  },
  build_test: {
    title: 'Build & Test',
    badge: 'STAGE 4: QUALITY CHECK',
    desc: 'Automates testing and minification. Lint checks inspect codebase quality, and automated scripts verify directory structures, HTML syntax, and visual assets before distribution.',
    logs: `[INFO] Run npm run lint
> eslint . --ext .js --max-warnings=0
✔ No linting issues detected.

[INFO] Run npm run test
> jest --coverage
PASS  tests/html-integrity.test.js
PASS  tests/css-properties.test.js
  ✓ HTML semantics verified (14ms)
  ✓ CSS Flexbox/Grid responsive structures match (9ms)
  
Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        1.45s
[SUCCESS] Quality tests passed. Build artifact generated.`,
    cmd: 'npm run lint && npm run test',
    action: 'Status: PASS'
  },
  security_scan: {
    title: 'Security Scan',
    badge: 'STAGE 5: DEVSECOPS SECURE',
    desc: 'Integrates critical DevSecOps stages: scans files for hardcoded secrets, performs infrastructure analysis on CloudFormation/Terraform IaC, and validates dependencies for CVE vulnerabilities.',
    logs: `[INFO] Running Security Scanner (GitGuardian, Trivy)...
[INFO] scanning local path [/github/workspace]...
[INFO] [GitGuardian] Checking for credentials, tokens, AWS keys...
  ✔ 0 secrets found. Code safe.
[INFO] [Trivy] Scanning static folders and modules...
  ✔ 0 Vulnerabilities found.
[INFO] [Trivy] Scanning IaC configurations (S3 policy rules)...
  ✔ 0 Vulnerabilities found.
[SUCCESS] Security verification concluded. Build approved.`,
    cmd: 'trivy fs --security-checks config,vuln .',
    action: 'Status: 0 CVE, 0 Secrets detected'
  },
  deploy_s3: {
    title: 'Deploy to AWS S3',
    badge: 'STAGE 6: STORAGE HOSTING',
    desc: 'AWS S3 hosts the application files. AWS CLI synchronizes distribution assets to the target S3 hosting bucket with custom HTTP cache-control metadata tags.',
    logs: `[INFO] Run aws s3 sync . s3://static-website-for-cicd-practice --delete
[INFO] S3 upload: ./index.html to s3://static-website-for-cicd-practice/index.html (Content-Type: text/html)
[INFO] S3 upload: ./css/style.css to s3://static-website-for-cicd-practice/css/style.css (Content-Type: text/css)
[INFO] S3 upload: ./js/script.js to s3://static-website-for-cicd-practice/js/script.js (Content-Type: application/javascript)
[INFO] S3 metadata set: Cache-Control: max-age=31536000 for style assets.
[SUCCESS] S3 storage synced. 12 objects updated, 0 deleted.`,
    cmd: 'aws s3 sync . s3://static-website-for-cicd-practice --delete',
    action: 'S3 Sync Completed -> status: 200 OK'
  },
  cloudfront_cdn: {
    title: 'CloudFront CDN',
    badge: 'STAGE 7: CACHE INVALIDATION',
    desc: 'Distributes the site content to 600+ global edge locations. An API invalidation is automatically created on CloudFront to clear stale caches immediately.',
    logs: `[INFO] Run aws cloudfront create-invalidation --distribution-id E2M3S4F5P6L7 --paths "/*"
[INFO] Invalidation request received by CloudFront Edge networks.
[INFO] Invalidation ID: I2P5L9F8N3W2
[INFO] Invalidation status: IN_PROGRESS
..........................................
[INFO] Cache successfully invalidated across all global Edge PoPs.
[SUCCESS] Invalidation complete. Live assets cached globally.`,
    cmd: 'aws cloudfront create-invalidation --dist-id E2M3S4F5P6L7',
    action: 'CDN Invalidation: SUCCESS'
  },
  production: {
    title: 'Production Live',
    badge: 'STAGE 8: ACTIVE ENDPOINT',
    desc: 'The website is live! Hosted under HTTPS with SSL/TLS termination, sub-20ms latency worldwide via AWS Certificate Manager (ACM), Route 53, and CloudFront.',
    logs: `[INFO] Run curl -I http://static-website-for-cicd-practice.s3-website-us-west-2.amazonaws.com
HTTP/1.1 200 OK
content-type: text/html; charset=UTF-8
content-length: 18245
date: Sat, 20 Jun 2026 03:10:00 GMT
server: AmazonS3
x-amz-request-id: T9aF0c_8lG4P...

[INFO] Running synthetic health checks...
[INFO] Latency check: Paris PoP (22ms), Tokyo PoP (48ms), Silicon Valley PoP (9ms)
[SUCCESS] Site live. Health check STATUS: 100% HEALTHY`,
    cmd: 'curl -I http://static-website-for-cicd-practice.s3-website-us-west-2.amazonaws.com',
    action: 'Active S3 hosting URL -> http://static-website-for-cicd-practice.s3-website-us-west-2.amazonaws.com'
  }
};

function initPipelineViewer() {
  const nodes = document.querySelectorAll('.pipeline-node');
  const detailsPanel = document.getElementById('pipeline-details');
  if (!nodes.length || !detailsPanel) return;

  const nodeTitle = detailsPanel.querySelector('.pipeline-detail-title');
  const nodeBadge = detailsPanel.querySelector('.pipeline-detail-badge');
  const nodeDesc = detailsPanel.querySelector('.pipeline-detail-description');
  const nodeLogs = detailsPanel.querySelector('.pipeline-detail-logs');
  const nodeCmd = detailsPanel.querySelector('.pipeline-detail-cmd');
  const nodeAction = detailsPanel.querySelector('.pipeline-detail-action-text');

  let logInterval = null;

  function displayNodeDetails(nodeKey) {
    const data = PIPELINE_DATA[nodeKey];
    if (!data) return;

    // Clear previous simulation interval
    if (logInterval) clearInterval(logInterval);

    // Apply text changes
    nodeTitle.textContent = data.title;
    nodeBadge.textContent = data.badge;
    nodeDesc.textContent = data.desc;
    nodeCmd.textContent = `$ ${data.cmd}`;
    nodeAction.textContent = data.action;

    // Log typing simulator
    nodeLogs.textContent = '';
    const logLines = data.logs.split('\n');
    let lineIdx = 0;

    logInterval = setInterval(() => {
      if (lineIdx < logLines.length) {
        nodeLogs.textContent += logLines[lineIdx] + '\n';
        nodeLogs.scrollTop = nodeLogs.scrollHeight;
        lineIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 85); // Write line every 85ms
  }

  // Node event listeners
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      // Toggle active states
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const nodeKey = node.getAttribute('data-node');
      displayNodeDetails(nodeKey);
    });
  });

  // Load first node by default (Developer)
  nodes[0].classList.add('active');
  displayNodeDetails('developer');
}

/* ==========================================================================
   5. AWS Architecture Diagram Toggler
   ========================================================================== */
function initAwsArchToggler() {
  const toggles = document.querySelectorAll('.btn-toggle');
  const diagramWrapper = document.getElementById('aws-diagram-wrapper');
  if (!toggles.length || !diagramWrapper) return;

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      // Update toggle buttons active class
      toggles.forEach(t => t.classList.remove('active'));
      toggle.classList.add('active');

      // Update diagram flow class
      const flow = toggle.getAttribute('data-flow');
      diagramWrapper.className = `aws-diagram-canvas active-flow ${flow}-active`;
      
      // Update SVG path flows
      const clientFlowPaths = document.querySelectorAll('.client-flow-line');
      const deployFlowPaths = document.querySelectorAll('.deploy-flow-line');
      
      if (flow === 'client') {
        clientFlowPaths.forEach(p => p.style.display = 'block');
        deployFlowPaths.forEach(p => p.style.display = 'none');
      } else {
        clientFlowPaths.forEach(p => p.style.display = 'none');
        deployFlowPaths.forEach(p => p.style.display = 'block');
      }
    });
  });

  // Initialize with client traffic flow by default
  const defaultToggle = document.querySelector('.btn-toggle[data-flow="client"]');
  if (defaultToggle) defaultToggle.click();
}

/* ==========================================================================
   6. Mobile Menu Logic
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    nav.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      nav.classList.remove('open');
    });
  });
}

/* ==========================================================================
   7. Form Submission Terminal Simulation
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status');
  if (!form || !statusMsg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('contact-email').value.trim();
    const command = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!email || !message) {
      statusMsg.className = 'form-status-msg error';
      statusMsg.textContent = '> ERROR: Inputs are empty. Please specify a sender email and a payload message.';
      return;
    }

    // Simulate submission
    statusMsg.className = 'form-status-msg info';
    statusMsg.style.color = '#3B82F6';
    statusMsg.textContent = '> [INFO] Initializing SMTP mail dispatcher tunnel...';

    setTimeout(() => {
      statusMsg.textContent = '> [INFO] Connecting to SMTP endpoint: smtp.cloudops.sh:587... OK';
      
      setTimeout(() => {
        statusMsg.textContent = `> [INFO] Packing envelope: from=${email}, cmd=${command || 'none'}`;
        
        setTimeout(() => {
          statusMsg.className = 'form-status-msg success';
          statusMsg.textContent = '> [SUCCESS] Message successfully delivered to DevOps mail queue. Exiting with exit code 0.';
          form.reset();
        }, 1000);
      }, 800);
    }, 600);
  });
}
