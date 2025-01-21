import { themeQuartz, iconSetAlpine } from 'ag-grid-community';

export function applyCustomTheme(userThemeParams) {
    return themeQuartz.withPart(iconSetAlpine).withParams({
        accentColor: userThemeParams.accentColor || "#0086F4",
        backgroundColor: userThemeParams.backgroundColor || "#F1EDE1",
        borderColor: userThemeParams.borderColor || "#98968F",
        borderRadius: userThemeParams.borderRadius || 0,
        fontFamily: userThemeParams.fontFamily || { googleFont: "Pixelify Sans" },
        fontSize: userThemeParams.fontSize || 15,
        foregroundColor: userThemeParams.foregroundColor || "#605E57",
        headerBackgroundColor: userThemeParams.headerBackgroundColor || "#E4DAD1",
    });
}
