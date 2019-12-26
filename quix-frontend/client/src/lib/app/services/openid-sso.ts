export const login = async (authUrl: string, apiBasePath?: string): Promise<any> => {
    const nonce = (Math.random() + 1).toString(36).substring(2, 11);
    const state = {};
    state[nonce] = {redirectUrl: location.href};
    document.cookie = `__quixOpenidState=${JSON.stringify(state)}`;

    // location.href = `${authUrl}&state=${nonce}`;
    const popup = window.open(`${authUrl}&state=${nonce}`, 'Auth', 'width=300,height=200');
    popup.addEventListener('unload', function(event) {
        this.opener.postMessage(`url change: ${this.location.pathname}`)
    })
    window.onmessage = (msg: MessageEvent) => {
        debugger;
        console.log(msg);
    }
}