import loadingImgSrc from './loading.svg';

export const Loading = new (class {
    constructor() {
        this.LoadingContainer = document.createElement('div');
        const LoadingContent = document.createElement('div');
        const LoadingImg = document.createElement('img');

        LoadingImg.src = loadingImgSrc;

        this.LoadingContainer.id = 'LoadingContainer';

        this.LoadingContainer.style.position = 'fixed';
        this.LoadingContainer.style.width = '100%';
        this.LoadingContainer.style.height = '100%';
        this.LoadingContainer.style.top = '0';
        this.LoadingContainer.style.left = '0';
        this.LoadingContainer.style.zIndex = '993';
        // this.LoadingContainer.style.pointerEvents = 'none';

        LoadingContent.style.position = 'absolute';
        LoadingContent.style.width = '110px';
        LoadingContent.style.height = '110px';
        LoadingContent.style.top = '50%';
        LoadingContent.style.left = '50%';
        LoadingContent.style.padding = '20px';
        LoadingContent.style.margin = '-75px 0 0 -50px';
        LoadingContent.style.borderRadius = '6px';
        LoadingContent.style.background = 'rgba(0, 0, 0, 0.75)';

        LoadingImg.style.width = '100%';
        LoadingImg.style.height = '100%';

        this.LoadingContainer.appendChild(LoadingContent);
        LoadingContent.appendChild(LoadingImg);
    }

    private LoadingContainer: HTMLDivElement;

    show(bgColor?: string) {
        this.LoadingContainer.style.backgroundColor = bgColor ? bgColor : '';
        document.body.appendChild(this.LoadingContainer);
    }

    hide() {
        if (!document.getElementById('LoadingContainer')) return;
        document.body.removeChild(this.LoadingContainer);
    }
})();
