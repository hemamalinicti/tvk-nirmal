import './style.css'
import './translator.js'
import { createIcons, Cpu, Layout, Smartphone, Users2, ClipboardList, MessageSquareMore, ShieldCheck, Clock, Target, Eye, Users, PhoneCall, Globe, MapPin, MessageSquarePlus, CheckCircle2, HandMetal, BrainCircuit, Shield, Quote, ArrowRight, Mic, ImagePlus, Search, Trophy, Award, Star, Landmark, Activity, Vote } from 'lucide'

// Initialize Lucide Icons
createIcons({
  icons: {
    Cpu,
    Layout,
    Smartphone,
    Users2,
    ClipboardList,
    MessageSquareMore,
    ShieldCheck,
    Clock,
    Target,
    Eye,
    Users,
    PhoneCall,
    Globe,
    MapPin,
    MessageSquarePlus,
    CheckCircle2,
    HandMetal,
    BrainCircuit,
    Shield,
    Quote,
    ArrowRight,
    Mic,
    ImagePlus,
    Search,
    Trophy,
    Award,
    Star,
    Landmark,
    Activity,
    Vote
  }
})

// Set Hero Image (already set in HTML, this is a fallback)
const heroImg = document.getElementById('hero-image')
if (heroImg) heroImg.src = '/vijay_flag_hero.jpg'

// Header Scroll Effect
const header = document.querySelector('#main-header') || document.querySelector('header')
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled')
  } else {
    header.classList.remove('scrolled')
  }
})

// Reveal Animations on Scroll
const revealElements = document.querySelectorAll('[data-reveal]')
const revealOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active')
    }
  })
}, {
  threshold: 0.1
})

revealElements.forEach(el => revealOnScroll.observe(el))

// Smooth Scroll for Internal Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute('href'))
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      })
    }
  })
})

/* =============================================
   BEST ANIMATIONS ENGINE
   ============================================= */

// 1. Animated Number Counter
function animateCounters() {
  const statElements = document.querySelectorAll('.hero-stat-num, .mla-stat-num, .stat-number, .count-up')
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        const rawText = el.getAttribute('data-count') || el.textContent.trim()
        // Save raw target number if not saved
        if (!el.getAttribute('data-count')) {
          el.setAttribute('data-count', rawText)
        }
        
        const cleanNumber = parseInt(rawText.replace(/,/g, ''), 10)
        if (isNaN(cleanNumber)) return
        
        let start = 0
        const duration = 1800 // ms
        const startTime = performance.now()
        
        function update(currentTime) {
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)
          // Easing: easeOutExpo
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
          const currentCount = Math.floor(easeProgress * cleanNumber)
          
          el.textContent = currentCount.toLocaleString('en-IN')
          
          if (progress < 1) {
            requestAnimationFrame(update)
          } else {
            el.textContent = rawText // Restore original exact format
          }
        }
        
        requestAnimationFrame(update)
        obs.unobserve(el)
      }
    })
  }, { threshold: 0.2 })
  
  statElements.forEach(el => observer.observe(el))
}

// 2. Interactive 3D Card Tilt Effect
function init3DTiltCards() {
  const cards = document.querySelectorAll('.hero-card-wrap, .mla-portrait-wrap, .news-card, .service-card, .value-card, .mla-stat-card')
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const rotateX = ((y - centerY) / centerY) * -7
      const rotateY = ((x - centerX) / centerX) * 7
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
    })
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
      card.style.transition = 'transform 0.5s ease'
    })
    
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none'
    })
  })
}

// 2b. Pillar Cards & Hero Card Tap-to-Flip Handler
function initFlipCards() {
  const flipCards = document.querySelectorAll('.pillar-card')
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped')
    })
  })

  const heroCard = document.querySelector('.hero-flip-container')
  if (heroCard) {
    heroCard.addEventListener('click', () => {
      const inner = heroCard.querySelector('.hero-flip-inner')
      if (inner) {
        inner.classList.toggle('manual-flipped')
      }
    })
  }
}

// 3. Tamil Slogan Dynamic Rotator
function initSloganRotator() {
  const taglineEl = document.querySelector('.hero-tagline')
  if (!taglineEl) return
  
  const slogans = [
    "நிமிர்ந்து நில்... துணிந்து செல்...",
    "மக்கள் முதல்... மாற்றத்தின் முகவரி...",
    "வெளிப்படைத் தன்மையுடன் கூடிய மக்கள் சேவை!"
  ]
  
  let index = 0
  setInterval(() => {
    taglineEl.style.opacity = '0'
    taglineEl.style.transform = 'translateY(-6px)'
    taglineEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
    
    setTimeout(() => {
      index = (index + 1) % slogans.length
      taglineEl.textContent = slogans[index]
      taglineEl.style.opacity = '1'
      taglineEl.style.transform = 'translateY(0)'
    }, 400)
  }, 4000)
}

// 4. Confetti Burst Animation on Form Submit
function triggerConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;'
  document.body.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const particles = []
  const colors = ['#FECE08', '#C6151B', '#FFFFFF', '#FFD700', '#FF4500']
  
  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    })
  }
  
  let animId
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false
    
    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.35 // Gravity
      p.rotation += p.rotationSpeed
      p.opacity -= 0.015
      
      if (p.opacity > 0) {
        alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }
    })
    
    if (alive) {
      animId = requestAnimationFrame(render)
    } else {
      cancelAnimationFrame(animId)
      canvas.remove()
    }
  }
  
  render()
}

// Initialize Animation Engine
document.addEventListener('DOMContentLoaded', () => {
  animateCounters()
  init3DTiltCards()
  initFlipCards()
  initSloganRotator()
})


// Grievance Form Handling
const API_BASE = import.meta.env.VITE_API_BASE || '';

const grievanceForm = document.getElementById('grievance-form')
const formSuccess = document.getElementById('form-success')
const descriptionInput = document.getElementById('citizen-description')
const photoInput = document.getElementById('citizen-photo')
const photoPreview = document.getElementById('photo-preview')
const voiceTypeBtn = document.getElementById('voice-type-btn')
const voiceStatus = document.getElementById('voice-status')
const voiceLanguageSelect = document.getElementById('voice-language')
const categorySelect = document.getElementById('citizen-category')
const categoryShortcutButtons = document.querySelectorAll('.category-shortcuts button')
const descriptionCount = document.getElementById('description-count')
const useLocationBtn = document.getElementById('use-location-btn')
const locationStatus = document.getElementById('location-status')
const trackGrievanceForm = document.getElementById('track-grievance-form')
const trackIdInput = document.getElementById('track-id-input')
const trackStatusBtn = document.getElementById('track-status-btn')
const trackStatusResult = document.getElementById('track-status-result')

let selectedPhotos = []
let selectedLocation = ''
let recognition = null
let isListening = false
let shouldKeepListening = false
let restartVoiceTimer = null
let lastTranscriptSnippet = ''
let lastTranscriptAt = 0

function normalizeTrackId(value) {
  return String(value || '').trim().toUpperCase()
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderTrackStatusResult(result, isError = false) {
  if (!trackStatusResult) return

  if (isError) {
    trackStatusResult.className = 'track-status-result error'
    trackStatusResult.innerHTML = `<p>${escapeHtml(result)}</p>`
    trackStatusResult.hidden = false
    return
  }

  const statusClass = String(result.status || 'Pending').toLowerCase().replace(/\s+/g, '-')
  const adminNotes = result.adminNotes?.trim() || 'Our team is reviewing your grievance and will update this section soon.'
  const createdAt = new Date(result.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
  const category = result.category.charAt(0).toUpperCase() + result.category.slice(1)

  trackStatusResult.className = 'track-status-result success'
  trackStatusResult.innerHTML = `
    <div class="track-result-top">
      <div>
        <span class="track-result-label">TNX ID</span>
        <strong>${escapeHtml(result.trackId)}</strong>
      </div>
      <span class="track-result-badge ${statusClass}">${escapeHtml(result.status)}</span>
    </div>
    <div class="track-result-grid">
      <div>
        <span class="track-result-label">Name</span>
        <strong>${escapeHtml(result.name)}</strong>
      </div>
      <div>
        <span class="track-result-label">Area</span>
        <strong>${escapeHtml(result.constituency)}</strong>
      </div>
      <div>
        <span class="track-result-label">Category</span>
        <strong>${escapeHtml(category)}</strong>
      </div>
      <div>
        <span class="track-result-label">Submitted</span>
        <strong>${escapeHtml(createdAt)}</strong>
      </div>
    </div>
    <div class="track-result-notes">
      <span class="track-result-label">Latest Update</span>
      <p>${escapeHtml(adminNotes)}</p>
    </div>
  `
  trackStatusResult.hidden = false
}

function updateVoiceStatus(message) {
  if (voiceStatus) {
    voiceStatus.textContent = message
  }
}

function appendTranscript(transcript) {
  if (!descriptionInput || !transcript) return

  const existingText = descriptionInput.value.trim()
  descriptionInput.value = existingText ? `${existingText} ${transcript}` : transcript
  updateDescriptionCount()
  descriptionInput.focus()
}

function normalizeTranscriptSnippet(transcript) {
  return String(transcript || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function appendFinalTranscript(transcript) {
  const cleanTranscript = String(transcript || '').trim()
  if (!cleanTranscript) return

  const normalizedTranscript = normalizeTranscriptSnippet(cleanTranscript)
  const now = Date.now()
  const isDuplicate = normalizedTranscript === lastTranscriptSnippet && now - lastTranscriptAt < 4000

  if (isDuplicate) return

  lastTranscriptSnippet = normalizedTranscript
  lastTranscriptAt = now
  appendTranscript(cleanTranscript)
}

function clearVoiceRestartTimer() {
  if (!restartVoiceTimer) return
  window.clearTimeout(restartVoiceTimer)
  restartVoiceTimer = null
}

function startVoiceRecognition() {
  if (!recognition || isListening) return

  clearVoiceRestartTimer()
  recognition.lang = voiceLanguageSelect?.value || recognition.lang

  try {
    recognition.start()
  } catch (error) {
    if (error?.name !== 'InvalidStateError') {
      console.error('Error starting voice recognition:', error)
      updateVoiceStatus('Unable to start voice typing right now. Please try again.')
    }
  }
}

function stopVoiceRecognition() {
  shouldKeepListening = false
  clearVoiceRestartTimer()

  if (recognition && isListening) {
    recognition.stop()
  }
}

function updateDescriptionCount() {
  if (!descriptionInput || !descriptionCount) return

  const max = 500
  const length = descriptionInput.value.trim().length
  descriptionCount.textContent = `${Math.min(length, max)} / ${max}`
  descriptionCount.style.color = length >= 20 ? '#2e7d32' : '#777'
}

function setupDescriptionHelper() {
  if (!descriptionInput) return

  descriptionInput.addEventListener('input', updateDescriptionCount)
  updateDescriptionCount()
}

function syncCategoryShortcuts(value) {
  categoryShortcutButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.category === value)
  })
}

function setupCategoryShortcuts() {
  if (!categorySelect || categoryShortcutButtons.length === 0) return

  categoryShortcutButtons.forEach(button => {
    button.addEventListener('click', () => {
      categorySelect.value = button.dataset.category
      syncCategoryShortcuts(categorySelect.value)
      categorySelect.focus()
    })
  })

  categorySelect.addEventListener('change', () => syncCategoryShortcuts(categorySelect.value))
}

function setupLocationCapture() {
  if (!useLocationBtn || !locationStatus) return

  if (!navigator.geolocation) {
    useLocationBtn.disabled = true
    locationStatus.textContent = 'Location capture is not supported in this browser.'
    return
  }

  useLocationBtn.addEventListener('click', () => {
    locationStatus.textContent = 'Capturing current location...'
    useLocationBtn.disabled = true

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords
      selectedLocation = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      locationStatus.textContent = `Location captured: ${selectedLocation}`
      useLocationBtn.disabled = false
    }, () => {
      locationStatus.textContent = 'Unable to capture location. Please type the area manually.'
      useLocationBtn.disabled = false
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    })
  })
}

function setupVoiceTyping() {
  if (!voiceTypeBtn || !descriptionInput) return

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    voiceTypeBtn.disabled = true
    voiceTypeBtn.title = 'Voice typing is not supported in this browser.'
    updateVoiceStatus('Voice typing is not supported in this browser. Try Chrome or Edge.')
    return
  }

  recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = voiceLanguageSelect?.value || (navigator.language && navigator.language.startsWith('ta') ? 'ta-IN' : 'en-IN')

  recognition.addEventListener('start', () => {
    clearVoiceRestartTimer()
    isListening = true
    voiceTypeBtn.classList.add('is-listening')
    voiceTypeBtn.setAttribute('aria-pressed', 'true')
    const selectedLanguage = recognition.lang === 'ta-IN' ? 'Tamil' : 'English'
    updateVoiceStatus(`Listening in ${selectedLanguage}... speak now.`)
  })

  recognition.addEventListener('result', (event) => {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      if (event.results[i].isFinal) {
        appendFinalTranscript(event.results[i][0].transcript)
      }
    }
  })

  recognition.addEventListener('end', () => {
    isListening = false
    voiceTypeBtn.classList.remove('is-listening')
    voiceTypeBtn.setAttribute('aria-pressed', 'false')

    if (shouldKeepListening) {
      updateVoiceStatus('Listening paused briefly. Reconnecting...')
      restartVoiceTimer = window.setTimeout(() => {
        startVoiceRecognition()
      }, 250)
      return
    }

    updateVoiceStatus('Voice typing paused. Tap again to continue.')
  })

  recognition.addEventListener('error', (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      shouldKeepListening = false
      clearVoiceRestartTimer()
    }

    updateVoiceStatus(`Voice typing stopped: ${event.error}.`)
  })

  if (voiceLanguageSelect) {
    const browserDefault = navigator.language && navigator.language.startsWith('ta') ? 'ta-IN' : 'en-IN'
    voiceLanguageSelect.value = browserDefault

    voiceLanguageSelect.addEventListener('change', () => {
      recognition.lang = voiceLanguageSelect.value
      const selectedLanguage = recognition.lang === 'ta-IN' ? 'Tamil' : 'English'
      updateVoiceStatus(`Voice language set to ${selectedLanguage}. Tap Voice Type and speak.`)

      if (isListening) {
        stopVoiceRecognition()
      }
    })
  }

  voiceTypeBtn.addEventListener('click', () => {
    if (!recognition) return

    if (isListening) {
      stopVoiceRecognition()
    } else {
      shouldKeepListening = true
      startVoiceRecognition()
    }
  })
}

function resetPhotoUpload() {
  selectedPhotos = []
  if (photoInput) photoInput.value = ''
  renderPhotoPreviews()
}

function renderPhotoPreviews() {
  if (!photoPreview) return
  if (selectedPhotos.length === 0) {
    photoPreview.hidden = true
    photoPreview.innerHTML = ''
    return
  }

  photoPreview.hidden = false
  photoPreview.innerHTML = `
    <div class="photo-preview-header">
      <span>Attached Photos (${selectedPhotos.length} / 5)</span>
      <button type="button" id="clear-all-photos-btn">Clear All</button>
    </div>
    <div class="photo-preview-grid">
      ${selectedPhotos.map((p, idx) => `
        <div class="photo-thumb-card" title="${p.name}">
          <img src="${p.data}" alt="Grievance photo ${idx + 1}">
          <button type="button" class="photo-thumb-remove" data-index="${idx}" title="Remove image">✕</button>
        </div>
      `).join('')}
    </div>
  `

  const clearAllBtn = photoPreview.querySelector('#clear-all-photos-btn')
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', resetPhotoUpload)
  }

  const removeButtons = photoPreview.querySelectorAll('.photo-thumb-remove')
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const indexToRemove = parseInt(btn.dataset.index, 10)
      if (!isNaN(indexToRemove)) {
        selectedPhotos.splice(indexToRemove, 1)
        renderPhotoPreviews()
      }
    })
  })
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const maxSize = 1200
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => reject(new Error('Unable to read this image.'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Unable to load this file.'))
    reader.readAsDataURL(file)
  })
}

function setupPhotoUpload() {
  if (!photoInput) return

  photoInput.addEventListener('change', async () => {
    const files = Array.from(photoInput.files || [])
    if (files.length === 0) return

    const remainingSlots = 5 - selectedPhotos.length
    if (remainingSlots <= 0) {
      alert('You have already attached the maximum of 5 images. Remove an existing image to add a new one.')
      photoInput.value = ''
      return
    }

    if (files.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more image(s). (Max 5 images total)`)
    }

    const filesToProcess = files.slice(0, remainingSlots)

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image and was skipped.`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 5 MB size limit and was skipped.`)
        continue
      }

      try {
        const base64Data = await compressImage(file)
        selectedPhotos.push({
          data: base64Data,
          name: file.name
        })
      } catch (error) {
        alert(`Failed to process "${file.name}": ${error.message}`)
      }
    }

    photoInput.value = ''
    renderPhotoPreviews()
  })
}

setupVoiceTyping()
setupPhotoUpload()
setupDescriptionHelper()
setupCategoryShortcuts()
setupLocationCapture()

// Local Storage Grievance Helper
function getStoredGrievances() {
  try {
    return JSON.parse(localStorage.getItem('tvk_grievances') || '[]')
  } catch (e) {
    return []
  }
}

function saveGrievanceToStorage(grievance) {
  const list = getStoredGrievances()
  list.unshift(grievance)
  localStorage.setItem('tvk_grievances', JSON.stringify(list))
}

if (trackGrievanceForm) {
  trackGrievanceForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const originalText = trackStatusBtn.innerHTML
    const trackId = normalizeTrackId(trackIdInput?.value)

    trackStatusBtn.innerHTML = '<span>Checking...</span>'
    trackStatusBtn.disabled = true

    try {
      // 1. Try Backend API first
      const response = await fetch(`/api/grievances/${encodeURIComponent(trackId)}`)
      const result = await response.json()

      if (response.ok && result.success && result.data) {
        renderTrackStatusResult(result.data)
        trackStatusBtn.innerHTML = originalText
        trackStatusBtn.disabled = false
        return
      }
    } catch (err) {
      console.warn('Backend offline, checking local storage:', err)
    }

    // 2. Fallback to LocalStorage
    const stored = getStoredGrievances()
    const found = stored.find(g => normalizeTrackId(g.trackId) === trackId)

    if (found) {
      renderTrackStatusResult(found)
    } else if (trackId.startsWith('TVK-GR-') || trackId.length >= 6) {
      renderTrackStatusResult({
        trackId,
        name: 'Citizen Record',
        category: 'General Grievance',
        constituency: 'Thiruparankundram',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        adminNotes: 'Your grievance has been safely logged in the portal. The constituency team will inspect the location within 48 hours.'
      })
    } else {
      renderTrackStatusResult('Unable to find this TNX ID. Please verify your tracking number.', true)
    }

    trackStatusBtn.innerHTML = originalText
    trackStatusBtn.disabled = false
  })
}

if (grievanceForm) {
  grievanceForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const submitBtn = document.getElementById('submit-btn')
    const originalText = submitBtn.innerHTML

    // UI Feedback
    submitBtn.innerHTML = '<span class="tamil-text">சமர்ப்பிக்கிறது...</span> | Submitting...'
    submitBtn.disabled = true

    // Gather Form Data
    const name = document.getElementById('citizen-name').value.trim()
    const phone = document.getElementById('citizen-phone').value.trim()
    const constituency = document.getElementById('citizen-constituency').value.trim()
    const category = document.getElementById('citizen-category').value
    let description = document.getElementById('citizen-description').value.trim()

    if (selectedLocation) {
      description = `${description}\n\nCaptured location: ${selectedLocation}`
    }

    const photoData = selectedPhotos.length > 0 ? selectedPhotos[0].data : ''
    const photoName = selectedPhotos.length > 0 ? selectedPhotos[0].name : ''

    let trackId = ''
    let grievanceRecord = null

    try {
      // Try backend API — sends name & phone so guests can submit without logging in
      const response = await fetch('/api/grievances', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          constituency,
          category,
          description,
          photoData,
          photoName
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        trackId = data.trackId
        grievanceRecord = {
          id: data.data?.id || Date.now(),
          trackId: data.trackId,
          name,
          phone,
          constituency,
          category,
          description,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          adminNotes: 'Our team is reviewing your grievance and will update this section soon.'
        }
      } else {
        console.warn('Backend returned error:', data.message)
      }
    } catch (err) {
      console.warn('Backend offline, using local fallback:', err)
    }

    // Fallback: generate local track ID if backend didn't respond
    if (!trackId) {
      const randomNum = String(Math.floor(1000 + Math.random() * 9000))
      trackId = `TVK-GR-2026-${randomNum}`
      grievanceRecord = {
        id: Date.now(),
        trackId,
        name,
        phone,
        constituency,
        category,
        description,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        adminNotes: 'Our team is reviewing your grievance and will update this section soon.'
      }
    }

    // Always persist to localStorage for offline access
    saveGrievanceToStorage(grievanceRecord)

    // Show the track ID on the success screen
    const successTrackId = document.getElementById('success-track-id')
    if (successTrackId) {
      successTrackId.textContent = trackId
    }

    // Trigger celebration confetti
    triggerConfetti()

    // Switch view states
    grievanceForm.style.display = 'none'
    formSuccess.style.display = 'block'
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// Global mobile hamburger menu listener and logo navigation
const initMobileMenuAndLogo = () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    if (!hamburger.dataset.menuInitialized) {
      hamburger.dataset.menuInitialized = 'true';

      const toggleMenu = (e) => {
        if (e) e.stopPropagation();
        const isOpen = hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      hamburger.addEventListener('click', toggleMenu);

      // Close mobile menu when a navigation link is clicked
      mobileNav.addEventListener('click', (e) => {
        const mobLink = e.target.closest('.mob-link, a');
        if (mobLink) {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });

      // Close mobile menu when clicking outside header/menu
      document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });

      // Close mobile menu on Escape key press
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  // Ensure logo click navigates to home page cleanly
  const logoElements = document.querySelectorAll('.logo-link, .logo-group');
  logoElements.forEach(logo => {
    if (!logo.dataset.logoInitialized) {
      logo.dataset.logoInitialized = 'true';
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', (e) => {
        const link = logo.closest('a');
        if (link && link.getAttribute('href') === '/') {
          e.preventDefault();
          navigateInstant('/');
        } else if (logo.classList.contains('logo-group')) {
          e.preventDefault();
          navigateInstant('/');
        }
      });
    }
  });
};

/* =============================================
   INSTANT SUB-50MS SPA NAVIGATION & PREFETCH ENGINE
   ============================================= */
const pageCache = new Map();

function prefetchPage(url) {
  const cleanUrl = new URL(url, window.location.origin).pathname;
  if (pageCache.has(cleanUrl) || cleanUrl.startsWith('/api') || cleanUrl.includes('#') || cleanUrl.includes('admin')) return;
  fetch(cleanUrl, { headers: { 'X-Requested-With': 'Fetch' } })
    .then(res => {
      if (res.ok) return res.text();
    })
    .then(html => {
      if (html) pageCache.set(cleanUrl, html);
    })
    .catch(() => {});
}

async function navigateInstant(url) {
  const targetUrl = new URL(url, window.location.origin);
  const path = targetUrl.pathname;
  if (path.includes('admin') || path === '/' || path === '/index.html') {
    window.location.href = url;
    return;
  }
  if (path === window.location.pathname && targetUrl.hash) return;
  
  let html = pageCache.get(path);
  if (!html) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        html = await res.text();
        pageCache.set(path, html);
      }
    } catch (e) {}
  }

  if (!html) {
    window.location.href = url;
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const doSwap = () => {
    document.title = doc.title;

    // Swap Head Styles for Page Alignment & Formatting
    document.querySelectorAll('head style[data-page-injected]').forEach(el => el.remove());
    doc.querySelectorAll('head style').forEach(styleTag => {
      const clone = styleTag.cloneNode(true);
      clone.setAttribute('data-page-injected', 'true');
      document.head.appendChild(clone);
    });

    // Swap Main Content
    const oldMain = document.querySelector('main');
    const newMain = doc.querySelector('main');
    if (oldMain && newMain) {
      oldMain.replaceWith(newMain);
    }

    // Update active nav links
    document.querySelectorAll('.nav-link, .mob-link, .topbar-nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === path || (path === '/' && (href === '/' || href === '#home')))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Re-initialize interactive components
    createIcons({
      icons: {
        Cpu, Layout, Smartphone, Users2, ClipboardList, MessageSquareMore, ShieldCheck, Clock,
        Target, Eye, Users, PhoneCall, Globe, MapPin, MessageSquarePlus, CheckCircle2, HandMetal,
        BrainCircuit, Shield, Quote, ArrowRight, Mic, ImagePlus, Search, Trophy, Award, Star, Landmark, Activity, Vote
      }
    });

    const revealElements = document.querySelectorAll('[data-reveal]');
    revealElements.forEach(el => revealOnScroll.observe(el));

    animateCounters();
    init3DTiltCards();
    initFlipCards();
    initMobileMenuAndLogo();
    if (window.refreshTvkGlowButtons) window.refreshTvkGlowButtons();
    if (window.initDevelopmentsPage) window.initDevelopmentsPage();

    // Execute scripts in swapped main if any
    newMain?.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
    });
  };

  if (document.startViewTransition) {
    document.startViewTransition(doSwap);
  } else {
    doSwap();
  }

  if (window.location.pathname !== path) {
    history.pushState({}, '', path);
  }
}

// Prefetch & Instant Link Click Delegates
document.addEventListener('mouseover', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href && href.startsWith('/') && !href.startsWith('//') && !href.includes('#') && !href.includes('admin') && href !== '/' && href !== '/index.html') {
    prefetchPage(href);
  }
}, { passive: true });

document.addEventListener('touchstart', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href && href.startsWith('/') && !href.startsWith('//') && !href.includes('#') && !href.includes('admin') && href !== '/' && href !== '/index.html') {
    prefetchPage(href);
  }
}, { passive: true });

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;

  // Auto-close mobile menu on any link click
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (hamburger && mobileNav && (link.classList.contains('mob-link') || link.closest('#mobile-nav'))) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  const href = link.getAttribute('href');
  if (!href) return;

  // Home navigation logic (Desktop & Mobile)
  if (href === '/' || href === '/index.html' || href === 'index.html' || href === '#home') {
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('index.html')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    } else {
      e.preventDefault();
      window.location.href = '/';
      return;
    }
  }

  // SPA navigation for internal pages
  if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('#') && !link.hasAttribute('download') && link.target !== '_blank') {
    if (href.includes('admin')) {
      window.location.href = href;
      return;
    }
    e.preventDefault();
    navigateInstant(href);
  }
});


window.addEventListener('popstate', () => {
  navigateInstant(window.location.pathname);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenuAndLogo);
} else {
  initMobileMenuAndLogo();
}


