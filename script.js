async function updateModelList() {
    if (!API) {
        document.getElementById('statusBar').textContent = "❌ API ikke initialisert.";
        return;
    }
    
    document.getElementById('statusBar').textContent = "🔍 Henter synlige modeller...";
    const select = document.getElementById('modelSelect');
    
    try {
        // Vi spør både viewer og prosjekt for å være sikre
        const allModels = await API.viewer.getModels();
        
        if (!allModels || allModels.length === 0) {
            select.innerHTML = '<option value="">– ingen modeller lastet i viewer –</option>';
            document.getElementById('statusBar').textContent = "⚠️ Ingen modeller funnet i 3D-visningen.";
            return;
        }
        
        // Vi filtrerer på de som er synlige (enabled)
        const visibleModels = allModels.filter(m => m.enabled === true);
        
        select.innerHTML = '';

        if (visibleModels.length === 0) {
            select.innerHTML = '<option value="">– ingen synlige (aktiverte) modeller –</option>';
            document.getElementById('statusBar').textContent = "ℹ️ Fant modeller, men ingen er skrudd på i laglisten.";
            return;
        }

        // Legger til "Alle"-valget
        const allOption = document.createElement('option');
        allOption.value = "all_visible";
        allOption.textContent = `⭐ Analyser alle synlige (${visibleModels.length})`;
        select.appendChild(allOption);

        // Legger til modellene
        visibleModels.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name || "Navnløs modell";
            select.appendChild(opt);
        });

        document.getElementById('statusBar').textContent = `✅ Liste oppdatert (${visibleModels.length} synlige).`;
    } catch (err) {
        console.error(err);
        document.getElementById('statusBar').textContent = "❌ Feil ved henting av modeller.";
        select.innerHTML = '<option value="">– feil ved henting –</option>';
    }
}
