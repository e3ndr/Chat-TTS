

MODULES.moduleClasses["chat_tts"] = class {

    constructor(id) {
        this.namespace = "chat_tts";
        this.type = "settings";
        this.id = id;
        this.lastclip = 0;
        this.queue = [];

        this.defaultSettings.skip = () => {
            this.skip();
        };
    }

    check() {
        if (!this.audio && (this.queue.length > 0)) {
            this.audio = new Audio("https://api.casterlabs.co/v1/polly?voice=" + this.settings.text_to_speech_voice + "&text=" + this.queue.shift());

            this.audio.addEventListener("ended", () => {
                this.audio = null;
                this.check();
            });

            this.audio.play();
        }
    }

    skip() {
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
            this.check();
        }
    }

    init() {
        console.log(`-Chat-TTS WebhookID-\n${this.settings.webhookId}\n--------------------`);

        koi.addEventListener("chat", (event) => {
            if (this.settings.enabled) {
                this.queue.push(encodeURIComponent(event.sender.username + " says " + event.message.trim()));
                this.check();
            }
        });

        this.kinoko = new Kinoko();

        this.kinoko.connect(this.settings.webhookId, "parent");

        this.kinoko.on("close", () => {
            setTimeout(() => {
                this.kinoko.connect(this.settings.webhookId, "parent");
            }, 5000);
        });

        this.kinoko.on("message", (message) => {
            switch (message.type) {
                case "ENABLE": {
                    this.settings.enabled = message.enabled;
                    MODULES.saveToStore(this);

                    if (!this.settings.enabled) {
                        this.skip();
                    }
                    break;
                }

                case "SKIP": {
                    this.skip();
                    break;
                }
            }
        });
    }

    getDataToStore() {
        return this.settings;
    }

    settingsDisplay = {
        text_to_speech_voice: "select",
        enabled: "checkbox",
        skip: "button"
    };

    defaultSettings = {
        text_to_speech_voice: ["Brian", "Russell", "Nicole", "Amy", "Salli", "Joanna", "Matthew", "Ivy", "Joey"],
        // skip: () => {}
        enabled: true,
        webhookId: `chat-tts:${generateUnsafeUniquePassword()}`
    };

};
