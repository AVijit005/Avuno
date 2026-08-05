 = "C:\Users\palav\.gemini\antigravity-cli\brain\45a0363c-33bd-4a33-8ca5-12c5d8c2acec\.system_generated\logs\transcript_full.jsonl"
 = Get-Content 
foreach ( in ) {
    if ( -match 'Completely rewrite LandingV2ForgettingHero from scratch after previous corruption') {
         =  | ConvertFrom-Json
        foreach ( in .tool_calls) {
            if (.name -match 'write_to_file') {
                 = .arguments.CodeContent
                if () {
                    Set-Content -Path "src\components\landing-v2\LandingV2ForgettingHero.tsx" -Value 
                    Write-Host "Extracted LandingV2ForgettingHero.tsx!"
                    exit
                }
            }
        }
    }
}
