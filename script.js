let highestZ = 1;

class Paper {
    holdingPaper = false;
    pointerId = null;

    startX = 0;
    startY = 0;
    prevX = 0;
    prevY = 0;

    velX = 0;
    velY = 0;

    rotation = Math.random() * 30 - 15;
    currentPaperX = 0;
    currentPaperY = 0;

    rotating = false;

    init(paper) {
        // make sure touch doesn't scroll when interacting with a paper
        paper.style.touchAction = paper.style.touchAction || 'none';
        paper.addEventListener('contextmenu', e => e.preventDefault()); // prevent right-click menu

        const onMove = (e) => {
            // only handle the pointer that started the interaction
            if (!this.holdingPaper || e.pointerId !== this.pointerId) return;

            // compute velocity
            this.velX = e.clientX - this.prevX;
            this.velY = e.clientY - this.prevY;

            // rotation mode (right-click / secondary button)
            if (this.rotating) {
                const dirX = e.clientX - this.startX;
                const dirY = e.clientY - this.startY;
                const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
                const nx = dirX / len;
                const ny = dirY / len;
                const angle = Math.atan2(ny, nx);
                let degrees = 180 * angle / Math.PI;
                degrees = (360 + Math.round(degrees)) % 360;
                this.rotation = degrees;
            } else {
                // translate paper by velocity
                this.currentPaperX += this.velX;
                this.currentPaperY += this.velY;
            }

            this.prevX = e.clientX;
            this.prevY = e.clientY;

            paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
        };

        const onUp = (e) => {
            if (e.pointerId === this.pointerId) {
                try { paper.releasePointerCapture(this.pointerId); } catch (err) {}
                this.holdingPaper = false;
                this.rotating = false;
                this.pointerId = null;

                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
                window.removeEventListener('pointercancel', onUp);
            }
        };

        paper.addEventListener('pointerdown', (e) => {
            // only start when not already holding another paper with this instance
            if (this.holdingPaper) return;

            this.holdingPaper = true;
            this.pointerId = e.pointerId;

            // bring to front
            paper.style.zIndex = highestZ;
            highestZ += 1;

            // capture pointer so we keep receiving moves
            try { paper.setPointerCapture(e.pointerId); } catch (err) {}

            // start positions
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.prevX = e.clientX;
            this.prevY = e.clientY;

            // right mouse button -> rotate mode
            if (e.button === 2) {
                this.rotating = true;
            } else {
                this.rotating = false;
            }

            // attach global move/up handlers for this interaction
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
        });
    }
}

const papers = Array.from(document.querySelectorAll('.paper'));
papers.forEach(el => {
    const p = new Paper();
    p.init(el);
});