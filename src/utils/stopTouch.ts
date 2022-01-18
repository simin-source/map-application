class StopTouch {
    private _el: Element | null = null;

    stop(id: string) {
        this._el = document.querySelector(`#${id}`);
        if (this._el) this._el.addEventListener('touchmove', this.scrollEvent);
    }
    open() {
        if (this._el) this._el.removeEventListener('touchmove', this.scrollEvent);
    }

    private scrollEvent(ev: Event) {
        // ev.stopPropagation();
        ev.preventDefault();
        // return false;
    }
}

export const stopTouch  = new StopTouch();