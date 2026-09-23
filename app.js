document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Animation
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Nav Menu Toggle
  const menuToggle = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when clicking links
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.textContent = '☰';
      });
    });
  }

  // 3. Product Carousel Scroll Logic
  const carousel = document.getElementById('product-carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (carousel && prevBtn && nextBtn) {
    const cardWidth = 324; // 300px width + 24px gap

    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft >= maxScroll - 5) {
        // Wrap around to start if at the end
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    });

    // Optional: Auto-slide every 6 seconds
    let autoSlideInterval = setInterval(() => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft >= maxScroll - 5) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 6000);

    // Stop auto-slide on user interaction
    const stopAutoSlide = () => {
      clearInterval(autoSlideInterval);
      carousel.removeEventListener('scroll', stopAutoSlide);
      prevBtn.removeEventListener('click', stopAutoSlide);
      nextBtn.removeEventListener('click', stopAutoSlide);
    };

    carousel.addEventListener('scroll', stopAutoSlide);
    prevBtn.addEventListener('click', stopAutoSlide);
    nextBtn.addEventListener('click', stopAutoSlide);
  }

  // 4. Product Category CTA Form Integrations
  const categoryButtons = document.querySelectorAll('.category-btn');
  const polymerSelect = document.getElementById('form-polymer');

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedCat = btn.getAttribute('data-category');
      if (polymerSelect) {
        // Pre-select options depending on the card clicked
        if (selectedCat === 'Virgin Polymers') {
          polymerSelect.value = 'PP';
        } else if (selectedCat === 'Near Prime') {
          polymerSelect.value = 'Near Prime / Off Grade';
        } else if (selectedCat === 'Recycled') {
          polymerSelect.value = 'Recycled Polymer';
        } else if (selectedCat === 'Plastic Waste') {
          polymerSelect.value = 'Plastic Waste';
        }
      }
    });
  });

  // 5. FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = question.nextElementSibling;
      const isActive = item.classList.contains('active');

      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // 6. Lead Form Validation & WhatsApp Redirect Builder
  const form = document.getElementById('polymer-request-form');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Get values
      const name = document.getElementById('form-name').value;
      const company = document.getElementById('form-company').value;
      const email = document.getElementById('form-email').value;
      const whatsapp = document.getElementById('form-whatsapp').value;
      const polymer = document.getElementById('form-polymer').value;
      const grade = document.getElementById('form-grade').value || 'Belirtilmedi';
      const quantity = document.getElementById('form-quantity').value;
      const port = document.getElementById('form-port').value;
      const message = document.getElementById('form-message').value || 'Yok';

      // Submit Button loading animation
      const submitBtn = document.getElementById('form-submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Talep işleniyor...';

      // Simulate API submit delay
      setTimeout(() => {
        submitBtn.textContent = '✓ Talebiniz Kaydedildi!';
        
        // Show success modal/alert
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
          margin-top: 20px;
          padding: 20px;
          background-color: rgba(37, 211, 102, 0.1);
          border: 1px solid #25d366;
          border-radius: 8px;
          color: #ffffff;
          text-align: center;
          font-size: 1.5rem;
          line-height: 1.5;
        `;
        successMessage.innerHTML = `
          <strong style="color: #25d366; font-size: 1.8rem; display: block; margin-bottom: 8px;">✓ Teşekkürler, ${name}!</strong>
          Talebinizi başarıyla kaydettik. En hızlı yanıtı almak için bu detayları doğrudan WhatsApp Polimer Uzmanımıza iletebilirsiniz.
          <a href="#" id="send-direct-wa-link" target="_blank" style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: #25d366;
            color: white;
            padding: 10px 16px;
            border-radius: 6px;
            margin-top: 15px;
            font-weight: bold;
            text-decoration: none;
            gap: 8px;
          ">
            💬 Bilgileri WhatsApp'a İlet
          </a>
        `;

        form.appendChild(successMessage);
        
        // Build whatsapp text message
        const waText = `Merhaba Polymer in Stock,%0A%0ATürkiye için fiyat ve stok durumu talebinde bulunmak istiyorum:%0A` +
          `• *İsim:* ${encodeURIComponent(name)}%0A` +
          `• *Firma:* ${encodeURIComponent(company)}%0A` +
          `• *Polimer:* ${encodeURIComponent(polymer)}%0A` +
          `• *Kalite/Spesifikasyon:* ${encodeURIComponent(grade)}%0A` +
          `• *Miktar:* ${encodeURIComponent(quantity)} Ton%0A` +
          `• *Varış Limanı:* ${encodeURIComponent(port)} Limanı%0A` +
          `• *E-posta/İletişim:* ${encodeURIComponent(email)} / ${encodeURIComponent(whatsapp)}%0A` +
          `• *Notlar:* ${encodeURIComponent(message)}`;

        const waLink = `https://wa.me/971509205838?text=${waText}`;

        // Set link target
        const waForwardBtn = document.getElementById('send-direct-wa-link');
        if (waForwardBtn) {
          waForwardBtn.href = waLink;
        }

        // Auto-redirect to WhatsApp after 2.5 seconds to close the deal
        setTimeout(() => {
          window.open(waLink, '_blank');
          form.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          setTimeout(() => successMessage.remove(), 5000);
        }, 2000);

      }, 1500);
    });
  }
});
