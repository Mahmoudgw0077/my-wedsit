async function getImage() {
    const prompt = document.getElementById('promptInput').value.trim();
    const imageContainer = document.getElementById('imageContainer');
  
    if (prompt === "") {
      alert("يرجى إدخال وصف للصورة.");
      return;
    }
  
    imageContainer.innerHTML = "جاري توليد الصورة...";
  
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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" // استبدل هذا بمفتاحك الحقيقي
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: "512x512"
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      const data = await response.json();
      const imageUrl = data.data[0].url;
  
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = prompt;
      imageContainer.innerHTML = "";
      imageContainer.appendChild(img);
    } catch (error) {
      console.error("خطأ في التوليد:", error);
      imageContainer.innerHTML = "لم يتم العثور على أي صورة. يرجى المحاولة مرة أخرى.";
    }
  }

// تعريف المتغيرات
const navLinks = document.querySelectorAll('nav ul li a');
const botCards = document.querySelectorAll('.bot-card');
const forms = document.querySelectorAll('form');
const createBotForm = document.getElementById('bot-creation-form');
const authForm = document.getElementById('auth-form');
const switchFormBtn = document.getElementById('switch-form');
const searchInput = document.querySelector('#search-input');

// حالة تسجيل الدخول
let isLoggedIn = false;
let currentUser = null;

// إنشاء بوت تليجرام
async function createTelegramBot(botData) {
    try {
        // 1. التحقق من صحة التوكن
        const checkResponse = await fetch(`https://api.telegram.org/bot${botData.token}/getMe`);
        const checkData = await checkResponse.json();
        
        if (!checkData.ok) {
            throw new Error('توكن البوت غير صالح');
        }

        // 2. إعداد نظام الذكاء الاصطناعي
        const systemPrompt = `أنت بوت تليجرام احترافي. ${botData.description}
        يجب أن تكون إجاباتك:
        - احترافية ومنظمة
        - دقيقة ومفصلة
        - مهذبة وواضحة
        - مفيدة وعملية
        
        استخدم اللغة العربية في جميع إجاباتك.`;

        // 3. إعداد ويب هوك للبوت
        const webhookUrl = `${window.location.origin}/webhook/${botData.token}`;
        const webhookResponse = await fetch(`https://api.telegram.org/bot${botData.token}/setWebhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: webhookUrl
            })
        });

        const webhookData = await webhookResponse.json();
        if (!webhookData.ok) {
            throw new Error('فشل في إعداد ويب هوك البوت');
        }

        // 4. إعداد أوامر البوت
        const commands = [
            { command: 'start', description: 'بدء المحادثة' },
            { command: 'help', description: 'عرض المساعدة' },
            { command: 'chat', description: 'بدء محادثة جديدة مع الذكاء الاصطناعي' }
        ];

        const commandsResponse = await fetch(`https://api.telegram.org/bot${botData.token}/setMyCommands`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commands: commands
            })
        });

        const commandsData = await commandsResponse.json();
        if (!commandsData.ok) {
            throw new Error('فشل في إعداد أوامر البوت');
        }

        // 5. حفظ البوت في الخادم
        const saveResponse = await fetch('/api/bots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...botData,
                webhook: webhookUrl,
                systemPrompt: systemPrompt,
                model: 'gpt-3.5-turbo'
            })
        });

        if (!saveResponse.ok) {
            throw new Error('فشل في حفظ البوت');
        }

        return {
            ...botData,
            webhook: webhookUrl,
            systemPrompt: systemPrompt,
            model: 'gpt-3.5-turbo'
        };

    } catch (error) {
        console.error('Error creating bot:', error);
        throw error;
    }
}

// معالجة رسائل البوت
async function handleBotMessage(bot, message) {
    try {
        // التحقق من الأمر
        if (message.text.startsWith('/')) {
            const command = message.text.split(' ')[0];
            switch (command) {
                case '/start':
                    await sendMessage(bot.token, message.chat.id, 
                        `مرحباً! أنا ${bot.name}، بوت ذكاء اصطناعي احترافي.
                        يمكنك التحدث معي مباشرة أو استخدام الأمر /chat لبدء محادثة جديدة.
                        سأكون سعيداً بمساعدتك في أي موضوع.`);
                    break;
                case '/help':
                    await sendMessage(bot.token, message.chat.id,
                        `الأوامر المتاحة:
                        /start - بدء المحادثة
                        /help - عرض المساعدة
                        /chat - بدء محادثة جديدة مع الذكاء الاصطناعي
                        
                        يمكنك التحدث معي مباشرة وسأجيبك بطريقة احترافية ومفيدة.`);
                    break;
                case '/chat':
                    await sendMessage(bot.token, message.chat.id,
                        'مرحباً! كيف يمكنني مساعدتك اليوم؟ سأكون سعيداً بتقديم المساعدة بأفضل طريقة ممكنة.');
                    break;
            }
            return;
        }

        // معالجة الرسائل العادية باستخدام الذكاء الاصطناعي
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: "system", content: bot.systemPrompt },
                    { role: "user", content: message.text }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error('فشل في الحصول على رد من الذكاء الاصطناعي');
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // إرسال الرد إلى المستخدم
        await sendMessage(bot.token, message.chat.id, aiResponse);

    } catch (error) {
        console.error('Error handling message:', error);
        await sendMessage(bot.token, message.chat.id, 
            'عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.');
    }
}

// إرسال رسالة عبر البوت
async function sendMessage(botToken, chatId, text) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    });
}

// معالجة نموذج إنشاء البوت
document.getElementById('bot-creation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const botToken = document.getElementById('bot-token').value;
    const botId = document.getElementById('bot-id').value;
    const botName = document.getElementById('bot-name').value;
    const botDescription = document.getElementById('bot-description').value;
    const botPersonality = document.getElementById('bot-personality').value;
    const openaiModel = document.getElementById('openai-model').value;
    
    try {
        // التحقق من صحة التوكن
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const data = await response.json();
        
        if (!data.ok) {
            throw new Error('توكن البوت غير صالح');
        }

        // التحقق من تطابق معرف البوت
        const tokenBotId = botToken.split(':')[0];
        if (tokenBotId !== botId) {
            throw new Error('معرف البوت لا يتطابق مع التوكن');
        }
        
        // إنشاء البوت
        const botData = {
            token: botToken,
            id: botId,
            name: botName,
            description: botDescription,
            personality: botPersonality,
            model: openaiModel,
            username: data.result.username
        };
        
        await createTelegramBot(botData);
        
        // عرض نتيجة الإنشاء
        document.getElementById('result-bot-name').textContent = botName;
        document.getElementById('result-bot-link').textContent = `@${data.result.username}`;
        document.getElementById('result-bot-link').href = `https://t.me/${data.result.username}`;
        document.getElementById('result-bot-token').textContent = botToken;
        
        document.getElementById('bot-creation-result').classList.remove('hidden');
        showAlert('تم إنشاء البوت بنجاح!', 'success');
        
    } catch (error) {
        showAlert(error.message, 'error');
    }
});

// حفظ البوت في التخزين المحلي
function saveBot(botData) {
    let bots = JSON.parse(localStorage.getItem('userBots') || '[]');
    bots.push({
        ...botData,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('userBots', JSON.stringify(bots));
}

// تحميل بوتات المستخدم
function loadUserBots() {
    const botsList = document.getElementById('bots-list');
    const bots = JSON.parse(localStorage.getItem('userBots') || '[]');
    
    botsList.innerHTML = bots.map(bot => `
        <div class="bot-card">
            <h3>${bot.name}</h3>
            <p>${bot.description}</p>
            <p><strong>اسم المستخدم:</strong> @${bot.username}</p>
            <p><strong>الشخصية:</strong> ${bot.personality}</p>
            <p><strong>تاريخ الإنشاء:</strong> ${new Date(bot.createdAt).toLocaleDateString('ar-SA')}</p>
            <div class="bot-actions">
                <a href="https://t.me/${bot.username}" target="_blank" class="btn">فتح البوت</a>
                <button class="btn secondary" onclick="deleteBot(${bot.id})">حذف البوت</button>
            </div>
        </div>
    `).join('');
}

// حذف البوت
async function deleteBot(botId) {
    const bots = JSON.parse(localStorage.getItem('userBots') || '[]');
    const bot = bots.find(b => b.id === botId);
    
    if (bot) {
        try {
            // حذف ويب هوك البوت
            await fetch(`https://api.telegram.org/bot${bot.token}/deleteWebhook`);
            
            // حذف البوت من التخزين المحلي
            const updatedBots = bots.filter(b => b.id !== botId);
            localStorage.setItem('userBots', JSON.stringify(updatedBots));
            
            loadUserBots();
            showAlert('تم حذف البوت بنجاح', 'success');
        } catch (error) {
            console.error('Error deleting bot:', error);
            showAlert('حدث خطأ أثناء حذف البوت', 'error');
        }
    }
}

// التبديل بين الأقسام
document.getElementById('home-link').addEventListener('click', () => {
    toggleSection('home-section');
});

document.getElementById('create-link').addEventListener('click', () => {
    if (!isLoggedIn) {
        showAlert('يجب تسجيل الدخول أولاً', 'error');
        toggleSection('login-section');
        return;
    }
    toggleSection('create-bot-section');
});

document.getElementById('mybots-link').addEventListener('click', () => {
    if (!isLoggedIn) {
        showAlert('يجب تسجيل الدخول أولاً', 'error');
        toggleSection('login-section');
        return;
    }
    toggleSection('my-bots-section');
    loadUserBots();
});

document.getElementById('login-link').addEventListener('click', () => {
    toggleSection('login-section');
});

// نسخ التوكن
document.getElementById('copy-token').addEventListener('click', () => {
    const token = document.getElementById('result-bot-token').textContent;
    navigator.clipboard.writeText(token).then(() => {
        showAlert('تم نسخ التوكن بنجاح', 'success');
    });
});

// تسجيل الدخول وإنشاء حساب
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (switchFormBtn.textContent === 'إنشاء حساب جديد') {
        // إنشاء حساب جديد
        if (password !== confirmPassword) {
            showAlert('كلمات المرور غير متطابقة', 'error');
            hideLoading();
            return;
        }
        
        // هنا يمكنك إضافة كود إنشاء حساب في قاعدة البيانات
        setTimeout(() => {
            isLoggedIn = true;
            currentUser = { email };
            showAlert('تم إنشاء الحساب بنجاح', 'success');
            toggleSection('create-bot-section');
            hideLoading();
        }, 1500);
    } else {
        // تسجيل الدخول
        // هنا يمكنك إضافة كود التحقق من تسجيل الدخول
        setTimeout(() => {
            isLoggedIn = true;
            currentUser = { email };
            showAlert('تم تسجيل الدخول بنجاح', 'success');
            toggleSection('create-bot-section');
            hideLoading();
        }, 1500);
    }
});

// التبديل بين تسجيل الدخول وإنشاء حساب
switchFormBtn.addEventListener('click', () => {
    const submitBtn = authForm.querySelector('button[type="submit"]');
    if (switchFormBtn.textContent === 'إنشاء حساب جديد') {
        switchFormBtn.textContent = 'تسجيل الدخول';
        submitBtn.textContent = 'إنشاء حساب';
        document.getElementById('confirm-password').parentElement.style.display = 'block';
    } else {
        switchFormBtn.textContent = 'إنشاء حساب جديد';
        submitBtn.textContent = 'تسجيل الدخول';
        document.getElementById('confirm-password').parentElement.style.display = 'none';
    }
});

// إضافة تأثيرات التنقل
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// إضافة تأثيرات للبطاقات
botCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// التحقق من النماذج
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        if (isValid) {
            showLoading();
            // محاكاة عملية الإرسال
            setTimeout(() => {
                hideLoading();
                showAlert('تم إرسال النموذج بنجاح!', 'success');
                form.reset();
            }, 1500);
        } else {
            showAlert('الرجاء ملء جميع الحقول المطلوبة', 'error');
        }
    });
});

// إضافة تأثيرات التمرير
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(0, 136, 204, 0.9)';
    } else {
        header.style.backgroundColor = 'var(--primary-color)';
    }
});

// إضافة وظيفة البحث
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.bot-card');
        
        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// إضافة وظيفة التحميل
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = `
        <div class="spinner"></div>
        <p>جاري التحميل...</p>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

// إضافة وظيفة التنبيهات
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// إضافة وظيفة التبديل بين الأقسام
function toggleSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من حالة تسجيل الدخول
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        isLoggedIn = true;
        currentUser = JSON.parse(storedUser);
    }
    
    // عرض قسم تسجيل الدخول افتراضياً
    toggleSection('login-section');
});