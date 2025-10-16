cd ios
echo "Enter release notes:"
read notes
fastlane firebase notes:"\"$notes\""
