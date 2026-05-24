const required = (value: string | undefined, name: string) => {
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
};

export const env = {
    apiBaseUrl: required(
        process.env.EXPO_PUBLIC_API_BASE_URL,
        'EXPO_PUBLIC_API_BASE_URL'
    ),
};
