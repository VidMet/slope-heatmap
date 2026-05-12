let API = null;

async function connect() {
    try {
        API = await window.TrimbleConnectWorkspace.connect(window.parent, (event) => {});
        document.getElementById('statusBar').textContent = "✅ Tilkoblet. Klikk Oppdater for å se modeller.";
        await updateModelList();
    } catch (e) {
        document.getElementById('statusBar').textContent = "❌ Kunne ikke koble til Trimble Connect.";
    }
}

// Funksjon for å hente kun synlige modeller
async function updateModelList() {
    if (!API) return;
    
    document.getElementById('statusBar').textContent = "🔍 Henter synlige modeller...";
    const allModels = await API.viewer.getModels();
    
    // Filtrerer ut kun modeller som er skrudd på i 3D-visningen
    const visibleModels = allModels.filter(m => m.enabled === true);
    
    const select = document.getElementById('modelSelect');
    select.innerHTML = '';
    
    if (visibleModels.length === 0) {
        select.innerHTML = '<option value="">– ingen synlige modeller –</option>';
        return;
    }

    // Legger til valget for "Alle" først
    const allOption = document.createElement('option');
    allOption.value = "all_visible";
    allOption.textContent = `⭐ Analyser alle synlige (${visibleModels.length})`;
    select.appendChild(allOption);

    // Legger til de individuelle modellene
    visibleModels.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        select.appendChild(opt);
    });

    document.getElementById('statusBar').textContent = `✅ Fant ${visibleModels.length} synlige modeller.`;
}

document.getElementById('btnSync').onclick = updateModelList;

document.getElementById('btnAnalyze').onclick = async () => {
    const target = document.getElementById('modelSelect').value;
    if (!target) return;

    document.getElementById('statusBar').textContent = "⏳ Beregner fall-geometri...";
    
    // Her starter analyse-logikken
    // I en full versjon ville vi her iterert gjennom mesh på de valgte modellene
    
    setTimeout(() => {
        document.getElementById('btnColorize').disabled = false;
        document.getElementById('statusBar').textContent = "✅ Analyse klar. Trykk på Heatmap.";
        
        // Simulerte verdier for demo
        document.getElementById('valRed').textContent = "8%";
        document.getElementById('valYellow').textContent = "15%";
        document.getElementById('valGreen').textContent = "77%";
    }, 1200);
};

document.getElementById('btnColorize').onclick = async () => {
    document.getElementById('statusBar').textContent = "🎨 Bruker fargeskala på mesh...";
};

// Start tilkobling
connect();
