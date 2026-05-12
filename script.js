/**
 * E6SO Fall-Analysator - Robust Versjon
 */

let API = null;

async function connect() {
    const status = document.getElementById('statusBar');
    status.textContent = "⏳ Kobler til Workspace API...";
    
    try {
        // Vi bruker TrimbleConnect-objektet direkte hvis det er definert, 
        // ellers bruker vi window.TrimbleConnectWorkspace
        const connector = window.TrimbleConnectWorkspace;
        
        if (!connector) {
            status.textContent = "❌ Feil: Workspace SDK ikke funnet.";
            return;
        }

        API = await connector.connect(window.parent, (event) => {
            if (event.type === "viewer.model.list.changed") {
                updateModelList();
            }
        });
        
        status.textContent = "✅ Tilkoblet. Henter modeller...";
        // Forsøk å hente med en gang, og en gang til etter 2 sekunder for sikkerhets skyld
        updateModelList();
        setTimeout(updateModelList, 2000);

    } catch (e) {
        status.textContent = "❌ Tilkoblingsfeil: " + e.message;
        console.error(e);
    }
}

async function updateModelList() {
    if (!API) return;
    
    const status = document.getElementById('statusBar');
    const select = document.getElementById('modelSelect');
    
    try {
        // Noen ganger ligge getModels under API.project eller API.viewer
        const models = await API.viewer.getModels();
        
        console.log("Modeller mottatt:", models); // Sjekk dette i F12 konsollen

        if (!models || !Array.isArray(models)) {
            status.textContent = "⚠️ Kunne ikke lese modell-liste (ugyldig format).";
            return;
        }

        // Vi prøver å finne synlige modeller, men hvis 'enabled' mangler, viser vi alle
        const visibleModels = models.filter(m => m.enabled === true || m.visible === true);
        
        // Debugging info til brukeren hvis listen er tom
        if (models.length > 0 && visibleModels.length === 0) {
            status.textContent = `ℹ️ Fant ${models.length} modeller totalt, men ingen er synlige (skrudd på).`;
        }

        select.innerHTML = '';
        
        if (models.length === 0) {
            select.innerHTML = '<option value="">– ingen modeller lastet –</option>';
            status.textContent = "⚠️ Ingen modeller funnet i prosjektet.";
            return;
        }

        // Legg til "Alle synlige" hvis vi fant noen
        if (visibleModels.length > 0) {
            const allOption = document.createElement('option');
            allOption.value = "all_visible";
            allOption.textContent = `⭐ Analyser alle synlige (${visibleModels.length})`;
            select.appendChild(allOption);
        } else {
            const allOption = document.createElement('option');
            allOption.value = "all_loaded";
            allOption.textContent = `⭐ Analyser alle lastede (${models.length})`;
            select.appendChild(allOption);
        }

        // Populer listen med de modellene vi fant
        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id || m.modelId;
            opt.textContent = (m.enabled ? "👁️ " : "📁 ") + (m.name || m.fileName || "Navnløs modell");
            select.appendChild(opt);
        });

        status.textContent = `✅ Liste klar (${models.length} modeller funnet).`;
        status.style.color = "#3fb950";

    } catch (err) {
        status.textContent = "❌ Feil: " + err.message;
        console.error("Detaljert feil:", err);
    }
}

// Event-handlere
document.getElementById('btnSync').onclick = updateModelList;

document.getElementById('btnAnalyze').onclick = async () => {
    const status = document.getElementById('statusBar');
    document.getElementById('valRed').textContent = "15%";
    document.getElementById('valYellow').textContent = "25%";
    document.getElementById('valGreen').textContent = "60%";
    document.getElementById('btnColorize').disabled = false;
    status.textContent = "✅ Analyse fullført (Demo-data).";
};

document.getElementById('btnColorize').onclick = () => {
    document.getElementById('statusBar').textContent = "🎨 Heatmap aktivert.";
};

// Initialiser
connect();
