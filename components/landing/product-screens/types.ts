export type ScreenVariant = "hardware" | "ai" | "cloud" | "app"

export interface ScreenLabels {
  // Shared header
  badge: string
  greeting: string
  user: string
  live: string

  // App screen (existing dashboard)
  alert: string
  humidity: string
  temperature: string
  soil: string
  savings: string
  weeklyTitle: string
  model: string
  accuracyLabel: string
  cta: string

  // Hardware screen
  hardwareTitle: string
  hardwareSubtitle: string
  hardwareSensorsLabel: string
  hardwareSensors: ReadonlyArray<{ name: string; status: string }>
  hardwareBatteryLabel: string
  hardwareRadioLabel: string
  hardwareSolarLabel: string

  // AI screen
  aiTitle: string
  aiSubtitle: string
  aiLayersLabel: string
  aiEpochsLabel: string
  aiAccuracyLabel: string
  aiConfusionLabel: string

  // Cloud screen
  cloudTitle: string
  cloudSubtitle: string
  cloudSourcesLabel: string
  cloudSources: ReadonlyArray<string>
  cloudEndpoint: string
  cloudLatencyLabel: string
  cloudDbLabel: string
  cloudUptimeLabel: string
}
