function calculateFootprint() {
    const milesDriven = document.getElementById('miles-driven').value;
    const powerConsumption = document.getElementById('power-consumption').value;

    const footprint = (milesDriven * 0.404 * 4) + (powerConsumption * 0.92);
    document.getElementById('footprint-result').innerHTML = `Your carbon footprint is ${footprint.toFixed(2)} kg of CO2 per month.`;
    
    showTips(footprint);
    enableSharing(footprint);
    loadResources();
}

function showTips(footprint) {
    const tips = [
        "Take public transport more often",
        "Use energy-efficient appliances",
        "Turn off lights and appliances when not in use",
        "Switch to renewable energy sources"
    ];
    const personalizedTips = tips.map(tip => `<li>${tip}</li>`).join('');
    document.getElementById('personalized-tips').innerHTML = `<ul>${personalizedTips}</ul>`;
}

function enableSharing(footprint) {
    const shareText = `I just calculated my carbon footprint: ${footprint.toFixed(2)} kg of CO2 per month. How about you?`;
    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    document.getElementById('share-twitter').href = twitterURL;
}

function loadResources() {
    const resources = [
        { title: "10 Ways to Reduce Your Carbon Footprint", url: "https://example.com/reduce-carbon-footprint" },
        { title: "The Impact of Renewable Energy", url: "https://example.com/renewable-energy" },
        { title: "How to Save Energy at Home", url: "https://example.com/save-energy" }
    ];
    const resourceList = resources.map(resource => 
        `<li><a href="${resource.url}" target="_blank">${resource.title}</a></li>`
    ).join('');
    document.getElementById('resource-list').innerHTML = `<ul>${resourceList}</ul>`;
}
