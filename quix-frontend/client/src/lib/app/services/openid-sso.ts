export const login = async (authUrl: string, apiBasePath?: string): Promise<any> => {
    location.href = `${authUrl}`;
}