// Wait for DOM to be fully loaded before initializing
window.addEventListener('DOMContentLoaded', function() {
  // Initialize UI elements
  initializeUIElements();
  
  // Set up event listeners
  setupEventListeners();
});

// Store DOM element references
const elements = {
  productInfo: null,
  loadingOverlay: null,
  uploadBtn: null,
  tryOnBtn: null,
  firstPage: null,
  secondPage: null,
  uploadedImageContainer: null,
  notification: null,
  imagePopup: null,
  popupImage: null,
  productImage: null,
  addToCartBtn: null,
  newImageBtn: null,
  closePopupBtn: null
};

// Initialize UI elements and store references
function initializeUIElements() {
  elements.productInfo = document.getElementById('product-info');
  elements.loadingOverlay = document.getElementById('loading-overlay');
  elements.uploadBtn = document.querySelector('.upload-btn');
  elements.tryOnBtn = document.querySelector('.try-on-btn');
  elements.firstPage = document.getElementById('1st-p');
  elements.secondPage = document.getElementById('2nd-p');
  elements.uploadedImageContainer = document.querySelector('.uploaded-image');
  elements.notification = document.getElementById('notification');
  elements.imagePopup = document.getElementById('imagePopup');
  elements.popupImage = document.querySelector('.popup-image');
  elements.productImage = document.querySelector('.product-image img');
  elements.addToCartBtn = document.querySelector('.add-to-cart-btn');
  elements.newImageBtn = document.querySelector('.new-image-btn');
  elements.closePopupBtn = document.querySelector('.popup-close-btn');
  
  // Disable try-on button initially
  if (elements.tryOnBtn) {
    elements.tryOnBtn.disabled = true;
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Upload functionality
  if (elements.uploadBtn) {
    elements.uploadBtn.addEventListener('click', handleImageUpload);
  }

  // Try-on button
  if (elements.tryOnBtn) {
    elements.tryOnBtn.addEventListener('click', handleTryOn);
  }

  // Add to cart functionality
  if (elements.addToCartBtn) {
    elements.addToCartBtn.addEventListener('click', handleAddToCart);
  }

  // New image button
  if (elements.newImageBtn) {
    elements.newImageBtn.addEventListener('click', handleNewImage);
  }

  // Image popup functionality
  if (elements.productImage) {
    elements.productImage.addEventListener('click', handleImagePopup);
  }

  // Close popup
  if (elements.closePopupBtn) {
    elements.closePopupBtn.addEventListener('click', () => {
      elements.imagePopup.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }

  // Close popup when clicking outside
  if (elements.imagePopup) {
    elements.imagePopup.addEventListener('click', (e) => {
      if (e.target === elements.imagePopup) {
        elements.imagePopup.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }
}

// Handle image upload
function handleImageUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size < 2000000) {
      showNotification({
        message: 'Please upload an image larger than 2MB for better results',
        backgroundColor: '#dc3545',
        textColor: 'white'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      // Create temporary image to get dimensions
      const tempImg = new Image();
      tempImg.onload = function() {
        elements.tryOnBtn.setAttribute('data-original-width', this.width);
        elements.tryOnBtn.setAttribute('data-original-height', this.height);
        elements.uploadedImageContainer.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" />`;
      };
      tempImg.src = e.target.result;
      
      handleImageProcessing(file);
    };
    reader.readAsDataURL(file);
  };
  
  input.click();
}

// Handle image processing and upload
function handleImageProcessing(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  // Get product details
  const productImage = elements.productImage;
  formData.append('productImageUrl', productImage.getAttribute('data-product-image'));
  formData.append('productTitle', productImage.getAttribute('data-product-title'));
  formData.append('productType', productImage.getAttribute('data-product-type'));

  elements.tryOnBtn.disabled = true;
  elements.tryOnBtn.classList.add('loading');

  fetch('/tools/rupantarai', {
    method: 'POST',
    body: formData,
    redirect: 'manual'
  })
  .then(handleResponse)
  .catch(handleError)
  .finally(() => {
    elements.tryOnBtn.classList.remove('loading');
  });
}

// Handle try-on process
function handleTryOn() {
  const imageId = elements.tryOnBtn.getAttribute('data-image-id');
  elements.loadingOverlay.classList.remove('hidden');
  
  function checkStatus() {
    fetch(`/tools/rupantarai?id=${imageId}`, {
      method: 'GET'
    })
    .then(response => response.json())
    .then(handleTryOnResponse)
    .catch(handleError);
  }

  checkStatus();
}

// Handle add to cart
async function handleAddToCart(event) {
  const productId = event.target.getAttribute('data-product-id');
  
  try {
    const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          id: parseInt(productId),
          quantity: 1
        }]
      })
    });

    if (response.ok) {
      showNotification({
        message: 'Successfully added to cart!',
        backgroundColor: '#007bff',
        textColor: 'white'
      });
      window.location.href = '/cart';
    } else {
      throw new Error('Failed to add to cart');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showNotification({
      message: 'Failed to add to cart. Please try again.',
      backgroundColor: '#dc3545',
      textColor: 'white'
    });
  }
}

// Handle new image request
function handleNewImage() {
  elements.firstPage.classList.remove('hidden');
  elements.secondPage.classList.add('hidden');
  elements.uploadedImageContainer.innerHTML = '';
  elements.tryOnBtn.disabled = true;
  elements.productImage.src = elements.productImage.getAttribute('data-product-image');
}

// Handle image popup
function handleImagePopup() {
  elements.popupImage.src = this.src;
  elements.imagePopup.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Handle API response
function handleResponse(response) {
  if (response.status === 200) {
    return response.json();
  }
  throw new Error(`HTTP error! status: ${response.status}`);
}

// Handle try-on API response
function handleTryOnResponse(data) {
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate image');
  }

  if (data.status === 'processing') {
    setTimeout(checkStatus, 5000);
  } else if (data.status === 'success') {
    processGeneratedImage(data.imageUrl);
  } else {
    throw new Error('Failed to generate image');
  }
}

// Process generated image
function processGeneratedImage(imageUrl) {
  const originalWidth = parseInt(elements.tryOnBtn.getAttribute('data-original-width'));
  const originalHeight = parseInt(elements.tryOnBtn.getAttribute('data-original-height'));
  
  const generatedImage = new Image();
  generatedImage.crossOrigin = 'anonymous';
  
  generatedImage.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(generatedImage, 0, 0, originalWidth, originalHeight);
    elements.productImage.src = canvas.toDataURL('image/jpeg');
    
    elements.loadingOverlay.classList.add('hidden');
    elements.firstPage.classList.add('hidden');
    elements.secondPage.classList.remove('hidden');
  };
  
  generatedImage.onerror = () => {
    throw new Error('Failed to load generated image');
  };
  
  generatedImage.src = imageUrl;
}

// Handle errors
function handleError(error) {
  console.error('Error:', error);
  elements.loadingOverlay.classList.add('hidden');
  
  // Reset image container
  const image = elements.uploadedImageContainer.querySelector('img');
  if (image) {
    image.src = '';
    image.classList.add('hidden');
  }
  
  showNotification({
    message: 'Error processing image. Please try again.',
    backgroundColor: '#dc3545',
    textColor: 'white',
    duration: 4000
  });
}

// Show notification
function showNotification(options = {}) {
  const {
    message = 'Action completed successfully!',
    backgroundColor = '#4CAF50',
    textColor = 'white',
    duration = 3000
  } = options;

  const notification = elements.notification;
  notification.querySelector('.message').textContent = message;
  notification.style.setProperty('--notification-bg', backgroundColor);
  notification.style.setProperty('--notification-color', textColor);
  
  notification.classList.remove('hidden');
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.classList.add('hidden'), 300);
  }, duration);
}