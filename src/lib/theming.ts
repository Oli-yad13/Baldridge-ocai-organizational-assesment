export interface OrganizationTheme {
  id: string
  name: string
  primaryColor: string
  logoUrl?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string
}

export class ThemingService {
  static getTheme(organization: any): OrganizationTheme {
    return {
      id: organization.id,
      name: organization.name,
      primaryColor: organization.primaryColor || '#3B82F6',
      logoUrl: organization.logoUrl,
      secondaryColor: this.generateSecondaryColor(organization.primaryColor || '#3B82F6'),
      accentColor: this.generateAccentColor(organization.primaryColor || '#3B82F6'),
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }

  static generateSecondaryColor(primaryColor: string): string {
    // Generate a complementary color
    const color = primaryColor.replace('#', '')
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)
    
    // Convert to HSL and adjust
    const hsl = this.rgbToHsl(r, g, b)
    const newHue = (hsl[0] + 180) % 360
    const newRgb = this.hslToRgb(newHue, hsl[1], Math.max(0.3, hsl[2] - 0.1))
    
    return `#${newRgb.map(x => x.toString(16).padStart(2, '0')).join('')}`
  }

  static generateAccentColor(primaryColor: string): string {
    // Generate a lighter accent color
    const color = primaryColor.replace('#', '')
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)
    
    const hsl = this.rgbToHsl(r, g, b)
    const newRgb = this.hslToRgb(hsl[0], hsl[1], Math.min(0.9, hsl[2] + 0.2))
    
    return `#${newRgb.map(x => x.toString(16).padStart(2, '0')).join('')}`
  }

  private static rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return [h * 360, s, l]
  }

  private static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360
    const a = s * Math.min(l, 1 - l)
    
    const f = (n: number) => {
      const k = (n + h * 12) % 12
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    }
    
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ]
  }

  static generateCSSVariables(theme: OrganizationTheme): Record<string, string> {
    return {
      '--color-primary': theme.primaryColor,
      '--color-secondary': theme.secondaryColor || this.generateSecondaryColor(theme.primaryColor),
      '--color-accent': theme.accentColor || this.generateAccentColor(theme.primaryColor),
      '--font-family': theme.fontFamily || 'Inter, system-ui, sans-serif',
      '--logo-url': theme.logoUrl ? `url(${theme.logoUrl})` : 'none'
    }
  }

  static applyTheme(theme: OrganizationTheme): void {
    const root = document.documentElement
    const cssVars = this.generateCSSVariables(theme)
    
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }
}
