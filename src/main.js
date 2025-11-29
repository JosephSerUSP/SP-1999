let $gameSystem, $gameParty, $gameMap, Renderer, UI, Cutscene, $gameBanter;

window.onload = () => {
    SceneManager.init();

    // Auto-scale to fit window
    const resizeGame = () => {
        const app = document.getElementById('app-container');
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const scale = Math.min(winW / 960, winH / 540);
        app.style.transform = `scale(${scale})`;
    };
    window.addEventListener('resize', resizeGame);
    resizeGame();
};
