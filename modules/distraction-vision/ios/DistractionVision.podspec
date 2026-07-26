Pod::Spec.new do |s|
  s.name           = 'DistractionVision'
  s.version        = '1.0.0'
  s.summary        = 'On-device face-landmark distraction/frustration signal via MediaPipe Tasks Vision'
  s.description    = 'Wraps Google MediaPipe Tasks Vision Face Landmarker for the Chiron camera affect engine.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '15.0'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  # Google's official on-device Face Landmarker. 0.10.35 is what resolves
  # today; pinned to a minor range so a later 0.10.x patch doesn't need a
  # podspec bump, but a 0.11 API change would need one reviewed deliberately.
  s.dependency 'MediaPipeTasksVision', '~> 0.10'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  # face_landmarker.task — bundled so classification works fully offline.
  s.resources = "assets/*.task"
end
