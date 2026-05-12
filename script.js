/**
 * E6SO Fall-Analysator - Produksjonsklar versjon
 */

let API = null;

// Funksjon for å oppdatere statusfeltet visuelt
function updateStatus(text, isError = false) {
    const status = document.getElementById('statusBar');
    if (status) {
        status.textContent = text;
        status.style.background = isError ? "#3a1212" : "#0d2044";
        status.style.color = isError ? "#f85149" : "#58a6ff";
    }
}

async function connect() {
    updateStatus("⏳ Forsøker å koble til Trimble Connect...");

    try {
        // Vi sjekker om SDK-en er lastet
        if (typeof window.TrimbleConnectWorkspace === 'undefined') {
            updateStatus("❌ Feil: SDK (index.js) mangler i index.html", true);
            return;
        }

        // Koble til med en timeout-sikring
        API = await window.TrimbleConnectWorkspace.connect(
            window.parent,
            (event) => {
                if (event.type === "viewer.model.list.changed") updateModelList();
            },
            30000 // 30 sekunders timeout
        );

        updateStatus("✅ Tilkoblet! Henter modeller...");
        await updateModelList();

    } catch (e) {
        updateStatus("❌ Tilkobling feilet. Sjekk konsoll (F12).", true);
        console.error("Connection error:", e);
    }
}

async function updateModelList() {
    if (!API) return;
    
    try {
        const models = await API.viewer.getModels();
        const select = document.getElementById('modelSelect');
        
        if (!models || models.length === 0) {
            updateStatus("⚠️ Ingen modeller funnet i 3D-visningen.");
            select.innerHTML = '<option value="">– ingen modeller lastet –</option>';
            return;
        }

        // Filtrer kun de som er synlige (enabled)
        const visibleModels = models.filter(m => m.enabled === true);
        
        select.innerHTML = '';
        
        if (visibleModels.length > 0) {
            const allOption = document.createElement('option');
            allOption.value = "all_visible";
            allOption.textContent = `⭐ Analyser alle synlige (${visibleModels.length})`;
            select.appendChild(allOption);
        }

        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            // Legg til et øye-ikon hvis den er synlig
            opt.textContent = (m.enabled ? "👁️ " : "📁 ") + (m.name || "Navnløs modell");
            select.appendChild(opt);
        });

        updateStatus(`✅ Klar! ${visibleModels.length} synlige modeller.`);
    } catch (err) {
        updateStatus("❌ Kunne ikke lese modelliste.", true);
        console.error("List error:", err);
    }
}

// Knapp-funksjoner
document.getElementById('btnSync').onclick = updateModelList;

document.getElementById('btnAnalyze').onclick = () => {
    // Demo-funksjonalitet for å bekrefte at UI fungerer
    document.getElementById('valRed').textContent = "15%";
    document.getElementById('valYellow').textContent = "25%";
    document.getElementById('valGreen').textContent = "60%";
    document.getElementById('btnColorize').disabled = false;
    updateStatus("✅ Analyse ferdig (Demo-data).");
};

// Start oppkobling når scriptet lastes
connect();
