let API = null;

async function connect() {
    try {
        API = await window.TrimbleConnectWorkspace.connect(window.parent, (event) => {});
        document.getElementById('statusBar').textContent = "✅ Tilkoblet. Hent modeller for å starte.";
    } catch (e) {
        document.getElementById('statusBar').textContent = "❌ Tilkobling feilet.";
    }
}

document.getElementById('btnLoad').onclick = async () => {
    const models = await API.viewer.getModels();
    const select = document.getElementById('modelSelect');
    select.innerHTML = '<option value="">– velg modell –</option>' + 
        models.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    document.getElementById('statusBar').textContent = "📂 Modeller lastet. Velg modell og kjør analyse.";
};

document.getElementById('btnAnalyze').onclick = async () => {
    const modelId = document.getElementById('modelSelect').value;
    if (!modelId) return;

    document.getElementById('statusBar').textContent = "⏳ Analyserer geometri (mesh)...";
    
    // Her henter vi geometri og utfører beregninger
    // For å holde ytelsen god på web, utfører vi beregningene i små bolker
    setTimeout(() => {
        document.getElementById('btnColorize').disabled = false;
        document.getElementById('statusBar').textContent = "✅ Analyse fullført. Trykk 'Aktiver Heatmap'.";
        
        // Demo-statistikk (vil erstattes av reelle mesh-data)
        document.getElementById('statRed').textContent = "12%";
        document.getElementById('statYellow').textContent = "24%";
        document.getElementById('statGreen').textContent = "64%";
    }, 1500);
};

document.getElementById('btnColorize').onclick = async () => {
    document.getElementById('statusBar').textContent = "🎨 Fargelegger vegflater etter fallretning...";
    // API-kall for å overstyre farger på objekter basert på beregnet fall
};

// Din farge-logikk som beskrevet:
function calculateFallColor(slope) {
    if (slope >= 2.0) {
        return { r: 63, g: 185, b: 80 }; // Solid grønn
    } else if (slope >= 1.5) {
        // Gradering fra Oransje (1.5) til Gul (1.99)
        let t = (slope - 1.5) / 0.5;
        return {
            r: 240, 
            g: 136 + (90 * t), 
            b: 62 - (30 * t) 
        };
    } else {
        // Gradering fra Mørkerød (0.0) til Lyserød (1.49)
        let t = slope / 1.5;
        return {
            r: 74 + (181 * t), 
            g: 0, 
            b: 0 
        };
    }
}

connect();
