const tc = new TrimbleConnect();

document.getElementById('runAnalysis').addEventListener('click', async () => {
    const api = await tc.viewer.getApi();
    const selection = await api.getSelection();

    if (selection.length === 0) {
        alert("Velg en eller flere vegflater først.");
        return;
    }

    selection.forEach(async (objId) => {
        const mesh = await api.getGeometry(objId);
        
        // Vi itererer gjennom alle triangler i meshen
        const colors = [];
        mesh.triangles.forEach(tri => {
            const slope = calculateSlope(tri.normal);
            const color = getFallColor(slope);
            colors.push(color.r, color.g, color.b, 255); // RGBA
        });

        // Oppdaterer fargene i viewer
        api.setObjectColors(objId, colors);
    });
});

function calculateSlope(normal) {
    // Regner ut prosentfall fra normalvektor
    const angleRad = Math.acos(normal.z);
    return Math.tan(angleRad) * 100;
}

function getFallColor(s) {
    if (s >= 2.0) return { r: 0, g: 255, b: 0 }; // Grønn
    
    if (s >= 1.5) {
        // Gradering Oransje (1.5) til Gul (2.0)
        let factor = (s - 1.5) / 0.5;
        return { r: 255, g: 165 + (90 * factor), b: 0 };
    }
    
    // Gradering Mørkerød (0) til Lysrød (1.49)
    let redFactor = s / 1.5;
    return { r: 139 + (116 * redFactor), g: 0, b: 0 };
}