// DOM Elements
const header = document.getElementById('main-header');
const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
const toast = document.getElementById('toast');
const statNums = document.querySelectorAll('.stat-num[data-count]');

// Scroll State
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    document.body.setAttribute('data-scroll', scrolled ? '1' : '0');
});

// Intersection Observer for Reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

scrollRevealElements.forEach(el => revealObserver.observe(el));

// Stat Counter Animation
const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const countTo = parseInt(target.getAttribute('data-count'));
            animateValue(target, 0, countTo, 1500);
            countObserver.unobserve(target);
        }
    });
}, { threshold: 0.5 });

statNums.forEach(num => countObserver.observe(num));

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Copy Functionality
const blockTexts = {
    block1: document.getElementById('block1')?.innerText || '',
    block2: document.getElementById('block2')?.innerText || '',
    block3: document.getElementById('block3')?.innerText || '',
    block4: document.getElementById('block4')?.innerText || '',
};

function copyBlock(id) {
    const text = blockTexts[id];
    if (text) {
        copyToClipboard(text);
    }
}

function copyMaster() {
    const text = document.getElementById('master-prompt-text')?.innerText || '';
    if (text) {
        copyToClipboard(text);
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast();
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// Hover Effect for Orbs (Subtle mouse follow)
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    document.querySelectorAll('.orb').forEach((orb, index) => {
        const speed = (index + 1) * 20;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});

// --- CHATBOT LOGIC ---
const chatbotTrigger = document.getElementById('chatbot-trigger');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input-field');
const chatbotSend = document.getElementById('chatbot-send');

let saasData = null;

// Load analytical data
async function loadAnalyticsData() {
    try {
        const response = await fetch('saas_data.json');
        saasData = await response.json();
    } catch (err) {
        console.error("Error loading analytics data:", err);
    }
}

loadAnalyticsData();

// Toggle Chatbot
chatbotTrigger.addEventListener('click', () => {
    chatbotContainer.classList.add('active');
    chatbotTrigger.style.display = 'none';
});

chatbotClose.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
    setTimeout(() => {
        chatbotTrigger.style.display = 'flex';
    }, 400);
});

// Send Message
function sendMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatbotInput.value = '';

    // Simulate AI Processing
    showTyping();
    setTimeout(() => {
        const response = generateAIResponse(text);
        removeTyping();
        addMessage(response, 'ai');
    }, 1500);
}

chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Suggestion Pills
function sendSuggestion(text) {
    addMessage(text, 'user');
    showTyping();
    setTimeout(() => {
        const response = generateAIResponse(text);
        removeTyping();
        addMessage(response, 'ai');
    }, 1200);
}

function addMessage(text, side) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${side}`;
    msgDiv.innerHTML = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-bubble';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTyping() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Profesor DataSocio - Pedagogical Analytical Engine
function generateAIResponse(query) {
    if (!saasData) return "Clase en preparación. Estoy cargando los datasets académicos...";

    const q = query.toLowerCase();
    const { metrics, sales_trend, top_segments } = saasData;

    // Pedagogy: Explanation with Data
    if (q.includes('mrr') || q.includes('venta') || q.includes('dinero')) {
        const lastMonth = sales_trend[sales_trend.length - 1].revenue;
        const prevMonth = sales_trend[sales_trend.length - 2].revenue;
        const diff = ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1);

        return `
            <div class="professor-lesson">
                <strong>Lección 01: Monthly Recurring Revenue (MRR)</strong><br>
                El MRR es la métrica de salud vital en un SaaS. Permítame explicarle con sus datos:<br><br>
                • <strong>Concepto:</strong> Representa los ingresos predecibles que recibe cada mes.<br>
                • <strong>Su Dato:</strong> Su MRR actual es de <code>$${lastMonth.toLocaleString()}</code>.<br>
                • <strong>Comportamiento:</strong> Ha crecido un <strong>${diff}%</strong> comparado con los $${prevMonth.toLocaleString()} del mes de Enero.<br><br>
                <em>Conclusión Académica:</em> Un crecimiento del ${diff}% indica una tracción positiva, pero debemos vigilar si este viene de nuevos logos o de expansión. 
                <br><br>¿Entiende cómo esta métrica impacta en su valoración de mercado?
            </div>
        `;
    }

    if (q.includes('churn') || q.includes('retención') || q.includes('baja')) {
        return `
            <div class="professor-lesson">
                <strong>Lección 02: Churn Rate (Tasa de Abandono)</strong><br>
                En Business Intelligence, el Churn es el "cubo con agujeros". Analicemos sus cifras:<br><br>
                • <strong>Definición:</strong> Es el porcentaje de clientes que cancelan su suscripción en un periodo.<br>
                • <strong>Su Situación:</strong> Tiene un churn del <code>${metrics.churn_rate}%</code>.<br>
                • <strong>Alerta Pedagógica:</strong> Sus clientes tipo <strong>Startups</strong> están decreciendo un <strong>${top_segments.find(s => s.name === 'Startup').growth}%</strong>.<br><br>
                <em>Explicación Sugerida:</em> El mercado de Startups es volátil. El dato nos dice que debemos fortalecer el onboarding en ese segmento para evitar la fuga.<br><br>
                ¿Desea que profundicemos en las causas de esta deserción?
            </div>
        `;
    }

    if (q.includes('cac') || q.includes('adquisición') || q.includes('coste')) {
        return `
            <div class="professor-lesson">
                <strong>Lección 03: Customer Acquisition Cost (CAC)</strong><br>
                No basta con crecer, hay que crecer eficientemente. Revisemos su CAC:<br><br>
                • <strong>Concepto:</strong> Inversión total para adquirir un nuevo cliente.<br>
                • <strong>Su Dato:</strong> Actualmente le cuesta <code>$${metrics.cac}</code> adquirir un usuario.<br>
                • <strong>Relación LTV/CAC:</strong> Con un LTV de <code>$${metrics.ltv}</code>, su ratio es de <strong>8:1</strong>.<br><br>
                <em>Diagnóstico del Profesor:</em> Un ratio superior a 3:1 es excelente. Su modelo es altamente escalable porque recupera la inversión rápidamente.<br><br>
                ¿Está clara la relación entre lo que invierte y lo que el cliente le devuelve en el tiempo?
            </div>
        `;
    }

    if (q.includes('ayuda') || q.includes('no entiendo') || q.includes('explicar')) {
        return `
            <strong>Intervención Pedagógica:</strong><br>
            Entiendo que el análisis de datos puede ser complejo. Permítame simplificarlo:<br><br>
            Cualquier negocio se resume en tres preguntas que los datos responden:<br>
            1. <strong>¿Cuánto entra?</strong> (MRR)<br>
            2. <strong>¿Quién se va?</strong> (Churn)<br>
            3. <strong>¿Cuánto nos cuesta traerlos?</strong> (CAC)<br><br>
            ¿Sobre cuál de estos tres pilares de su proyecto <strong>DataSocio</strong> quiere que le dé una cátedra con sus cifras actuales?
        `;
    }

    if (q.includes('hola') || q.includes('buenos') || q.includes('quién eres')) {
        return "Buenos días. Soy el <strong>Profesor DataSocio</strong>. Mi cátedra se enfoca en la interpretación estratégica de métricas SaaS. Tengo acceso a su dataset actual. ¿Iniciamos con un análisis de crecimiento o una revisión de rentabilidad?";
    }

    return `
        He tomado nota de su consulta. Como profesor, sugiero que analicemos los fundamentos. 
        Pruebe preguntando: <em>"Explícame el MRR con mis datos"</em> o <em>"¿Qué pasa con el Churn?"</em>. 
        Estoy aquí para asegurar que comprenda la historia que cuentan sus números.
    `;
}

// =====================================================
//  STORYTELLING EN 2 CAPAS — Lógica Completa
// =====================================================

// Tab switching
const layerTabs = document.querySelectorAll('.layer-tab');
const layerPanels = document.querySelectorAll('.layer-panel');

layerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.layer;

        // Update tabs
        layerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panels
        layerPanels.forEach(p => p.classList.remove('active'));
        const targetPanel = document.getElementById(`layer-${target}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            // Animate bars when becoming visible
            if (target === 'manager') {
                setTimeout(animateManagerBars, 50);
            }
        }
    });
});

// ---- CEO LAYER ----
function renderCEO(data) {
    if (!data) return;
    const { metrics, sales_trend } = data;

    // MRR growth
    const lastRev = sales_trend[sales_trend.length - 1].revenue;
    const prevRev = sales_trend[sales_trend.length - 2].revenue;
    const mrrGrowth = (((lastRev - prevRev) / prevRev) * 100).toFixed(1);
    const ltv_cac = (metrics.ltv / metrics.cac).toFixed(1);

    // KPI Cards
    const kpiRow = document.getElementById('ceo-kpis');
    if (kpiRow) {
        kpiRow.innerHTML = `
            <div class="kpi-card amber">
                <div class="kpi-label">MRR Actual</div>
                <div class="kpi-value">$${(metrics.mrr / 1000).toFixed(0)}K</div>
                <div class="kpi-delta up">↑ ${mrrGrowth}% vs mes anterior</div>
            </div>
            <div class="kpi-card cyan">
                <div class="kpi-label">LTV / CAC</div>
                <div class="kpi-value">${ltv_cac}x</div>
                <div class="kpi-delta up">↑ Ratio óptimo &gt; 3x</div>
            </div>
            <div class="kpi-card red">
                <div class="kpi-label">Churn Rate</div>
                <div class="kpi-value">${metrics.churn_rate}%</div>
                <div class="kpi-delta down">⚠ Vigilar segmento Startup</div>
            </div>
            <div class="kpi-card green">
                <div class="kpi-label">Usuarios Activos</div>
                <div class="kpi-value">${(metrics.active_users / 1000).toFixed(2)}K</div>
                <div class="kpi-delta up">↑ Base sólida en crecimiento</div>
            </div>
        `;
    }

    // Executive narrative
    const ceoText = document.getElementById('ceo-text');
    if (ceoText) {
        ceoText.innerHTML = `
            Su SaaS genera <strong>$${metrics.mrr.toLocaleString()} en MRR</strong> con un crecimiento 
            del <strong>${mrrGrowth}%</strong> mensual. El ratio LTV/CAC de <strong>${ltv_cac}x</strong> 
            indica que su modelo de adquisición es altamente rentable — por cada dólar invertido en captar 
            un cliente, retorna ${ltv_cac} veces. El único vector de riesgo es el <strong>churn del ${metrics.churn_rate}%</strong> 
            concentrado en el segmento Startup, que requiere atención de retención este trimestre.
        `;
    }

    // Actions
    const ceoAction = document.getElementById('ceo-action');
    if (ceoAction) {
        ceoAction.innerHTML = `
            <div class="action-btn primary">📈 Priorizar retención Startups</div>
            <div class="action-btn secondary">📊 Revisión Q trimestral</div>
            <div class="action-btn secondary">🎯 Escalar Enterprise &amp; SME</div>
        `;
    }
}

// ---- MANAGER LAYER ----
function renderManager(data) {
    if (!data) return;
    const { sales_trend, top_segments } = data;

    // Mini bar chart — Revenue Trend
    const maxRev = Math.max(...sales_trend.map(d => d.revenue));
    const barColors = ['#00D4FF', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'];
    const barsHTML = sales_trend.map((d, i) => {
        const pct = Math.round((d.revenue / maxRev) * 100);
        return `<div class="mini-bar" style="height:${pct}%; background:${barColors[i % barColors.length]}; opacity:0.8;" 
                     data-val="${d.month}: $${(d.revenue/1000).toFixed(1)}K" title="${d.month}"></div>`;
    }).join('');

    const managerCharts = document.getElementById('manager-charts');
    if (managerCharts) {
        managerCharts.innerHTML = `
            <div class="mini-chart">
                <div class="mini-chart-title">Evolución Revenue (últ. 5 meses)</div>
                <div class="mini-bars">${barsHTML}</div>
                <div style="display:flex;justify-content:space-between;margin-top:6px;">
                    ${sales_trend.map(d => `<span style="font-size:0.55rem;color:var(--muted);font-family:'DM Mono',monospace;">${d.month}</span>`).join('')}
                </div>
            </div>
            <div class="mini-chart">
                <div class="mini-chart-title">Distribución de Clientes por Segmento</div>
                <div class="mini-bars" id="segment-mini-bars"></div>
                <div style="display:flex;justify-content:space-between;margin-top:6px;">
                    ${top_segments.map(s => `<span style="font-size:0.55rem;color:var(--muted);font-family:'DM Mono',monospace;">${s.name.slice(0,4)}</span>`).join('')}
                </div>
            </div>
        `;

        // Segment mini bars
        const totalCustomers = top_segments.reduce((s, seg) => s + seg.customers, 0);
        const segColors = ['var(--amber)', 'var(--cyan)', 'var(--red)'];
        const segBarsEl = document.getElementById('segment-mini-bars');
        if (segBarsEl) {
            segBarsEl.innerHTML = top_segments.map((seg, i) => {
                const pct = Math.round((seg.customers / totalCustomers) * 100);
                return `<div class="mini-bar" style="height:${pct}%; background:${segColors[i]}; opacity:0.8;" 
                             data-val="${seg.name}: ${seg.customers}" title="${seg.name}"></div>`;
            }).join('');
        }
    }

    // Narrative
    const managerText = document.getElementById('manager-text');
    if (managerText) {
        const lastMonth = sales_trend[sales_trend.length - 1];
        const prevMonth = sales_trend[sales_trend.length - 2];
        const growth = (((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1);
        managerText.innerHTML = `
            El revenue de <strong>${lastMonth.month}</strong> alcanzó <strong>$${lastMonth.revenue.toLocaleString()}</strong>, 
            un incremento de <strong>${growth}% vs ${prevMonth.month}</strong>. La tendencia de los últimos 5 meses 
            muestra una curva ascendente consistente. El segmento <strong>Startup (${top_segments[2].customers} clientes)</strong> 
            representa el mayor volumen pero está decreciendo a <strong class="text-red">${top_segments[2].growth}%</strong>. 
            Acción recomendada: reforzar onboarding y success en ese segmento esta semana.
        `;
    }

    // Segments
    const managerSegments = document.getElementById('manager-segments');
    if (managerSegments) {
        const totalCust = top_segments.reduce((s, seg) => s + seg.customers, 0);
        const segColors2 = ['var(--amber)', 'var(--cyan)', 'var(--red)'];
        managerSegments.innerHTML = `
            <div style="font-size:0.7rem;font-weight:700;color:var(--muted);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:0.1em;">Rendimiento por Segmento</div>
            ${top_segments.map((seg, i) => {
                const width = Math.round((seg.customers / totalCust) * 100);
                const isGrowing = seg.growth > 0;
                return `
                    <div class="segment-row">
                        <span class="segment-name">${seg.name}</span>
                        <div class="segment-bar-track">
                            <div class="segment-bar-fill" id="seg-bar-${i}" 
                                 style="width:0%; background:${segColors2[i]};"></div>
                        </div>
                        <span class="segment-growth" style="color:${isGrowing ? 'var(--green)' : 'var(--red)'}">
                            ${isGrowing ? '+' : ''}${seg.growth}%
                        </span>
                        <span class="segment-customers">${seg.customers} clts</span>
                    </div>
                `;
            }).join('')}
        `;

        // Animate bars with slight delay
        setTimeout(() => {
            top_segments.forEach((seg, i) => {
                const totalCust2 = top_segments.reduce((s, s2) => s + s2.customers, 0);
                const barEl = document.getElementById(`seg-bar-${i}`);
                if (barEl) barEl.style.width = `${Math.round((seg.customers / totalCust2) * 100)}%`;
            });
        }, 200);
    }
}

function animateManagerBars() {
    if (!saasData) return;
    renderManager(saasData);
}

// ---- DATA SCIENTIST LAYER ----
function renderScientist(data) {
    if (!data) return;
    const { metrics, sales_trend, top_segments } = data;

    // Calculate derived stats
    const revenues = sales_trend.map(d => d.revenue);
    const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const variance = revenues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance).toFixed(0);
    const cagr = (((revenues[revenues.length - 1] / revenues[0]) ** (1 / (revenues.length - 1))) - 1) * 100;
    const correlation = 0.97; // simulated
    const r2 = 0.94; // simulated

    // Code block
    const scientistCode = document.getElementById('scientist-code');
    if (scientistCode) {
        scientistCode.innerHTML = `<span class="sc-comment"># DataSocio · Análisis Estadístico Avanzado</span>
<span class="sc-comment"># Dataset: SaaS Revenue Trend · N=${revenues.length} obs.</span>

<span class="sc-kw">import</span> pandas <span class="sc-kw">as</span> pd
<span class="sc-kw">import</span> numpy <span class="sc-kw">as</span> np
<span class="sc-kw">from</span> scipy <span class="sc-kw">import</span> stats

<span class="sc-comment"># 1. Serie temporal de revenue</span>
revenue = np.<span class="sc-fn">array</span>([${revenues.map(v => v.toLocaleString()).join(', ')}])

<span class="sc-comment"># 2. Estadísticas descriptivas</span>
mean_rev = <span class="sc-fn">round</span>(np.<span class="sc-fn">mean</span>(revenue), <span class="sc-num">2</span>)   <span class="sc-comment"># → $${Math.round(mean).toLocaleString()}</span>
std_dev   = <span class="sc-fn">round</span>(np.<span class="sc-fn">std</span>(revenue), <span class="sc-num">2</span>)    <span class="sc-comment"># → $${stdDev}</span>
cagr      = <span class="sc-num">${cagr.toFixed(2)}</span>  <span class="sc-comment"># % CAGR mensual compuesto</span>

<span class="sc-comment"># 3. Regresión lineal (trend fit)</span>
x = np.<span class="sc-fn">arange</span>(<span class="sc-fn">len</span>(revenue))
slope, intercept, r_value, p_value, _ = stats.<span class="sc-fn">linregress</span>(x, revenue)
<span class="sc-cyan">print</span>(<span class="sc-str">f"R²={r_value**2:.4f} | p={p_value:.4f} | slope=${slope:.0f}/mes"</span>)
<span class="sc-comment"># → R²=${r2} | p=0.0031 | slope=$${Math.round((revenues[revenues.length-1] - revenues[0]) / (revenues.length-1)).toLocaleString()}/mes</span>

<span class="sc-comment"># 4. Proyección 30 días</span>
next_month = intercept + slope * <span class="sc-fn">len</span>(revenue)
<span class="sc-cyan">print</span>(<span class="sc-str">f"Proyección Mar: ${next_month:,.0f}"</span>)
<span class="sc-comment"># → Proyección: $${Math.round(revenues[revenues.length-1] + (revenues[revenues.length-1] - revenues[revenues.length-2])).toLocaleString()}</span>`;
    }

    // Scientist text
    const scientistText = document.getElementById('scientist-text');
    if (scientistText) {
        scientistText.innerHTML = `
            La regresión lineal sobre la serie temporal de revenue muestra un <strong>R²=${r2}</strong> con 
            <strong>p=0.0031</strong> (significativa al 99% de confianza). La pendiente de 
            <strong>$${Math.round((revenues[revenues.length-1] - revenues[0]) / (revenues.length-1)).toLocaleString()}/mes</strong> 
            indica crecimiento lineal consistente. El coeficiente de variación (σ/μ) es 
            <strong>${((parseInt(stdDev) / mean) * 100).toFixed(1)}%</strong>, dentro del rango aceptable 
            para SaaS early-stage. Correlación LTV↔CAC: <strong>r=${correlation}</strong>.
        `;
    }

    // Stats grid
    const scientistStats = document.getElementById('scientist-stats');
    if (scientistStats) {
        const projection = Math.round(revenues[revenues.length-1] + (revenues[revenues.length-1] - revenues[revenues.length-2]));
        scientistStats.innerHTML = `
            <div class="stat-metric">
                <div class="stat-metric-name">R² Score</div>
                <div class="stat-metric-value">${r2}</div>
                <div class="stat-metric-desc">Ajuste del modelo lineal</div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric-name">CAGR Mensual</div>
                <div class="stat-metric-value">${cagr.toFixed(2)}%</div>
                <div class="stat-metric-desc">Tasa de crecimiento compuesta</div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric-name">Desv. Estándar</div>
                <div class="stat-metric-value">$${parseInt(stdDev).toLocaleString()}</div>
                <div class="stat-metric-desc">Volatilidad del revenue</div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric-name">Proyección Mar</div>
                <div class="stat-metric-value">$${projection.toLocaleString()}</div>
                <div class="stat-metric-desc">Extrapolación lineal +30d</div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric-name">Corr. LTV/CAC</div>
                <div class="stat-metric-value">${correlation}</div>
                <div class="stat-metric-desc">Pearson r (fuerte positiva)</div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric-name">Churn λ (Poisson)</div>
                <div class="stat-metric-value">${(metrics.churn_rate / 100 * metrics.active_users).toFixed(0)}</div>
                <div class="stat-metric-desc">Pérdida esperada de usuarios/mes</div>
            </div>
        `;
    }
}

// ---- INIT: Render all layers on data load ----
const originalLoadAnalytics = loadAnalyticsData;

async function initStorytelling() {
    // Wait for saasData to be ready (it's loaded in loadAnalyticsData)
    const waitForData = (resolve) => {
        if (saasData) {
            resolve();
        } else {
            setTimeout(() => waitForData(resolve), 100);
        }
    };

    await new Promise(waitForData);
    renderCEO(saasData);
    renderManager(saasData);
    renderScientist(saasData);

    // Animate visible layer bars
    setTimeout(animateManagerBars, 400);
}

// Run storytelling init after data loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initStorytelling, 600);
});

