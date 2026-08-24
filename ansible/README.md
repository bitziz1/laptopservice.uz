# Ansible Playbook для развертывания laptopservice.uz на Ubuntu 24.04 LTS

Плейбук выполняет полный цикл настройки «с нуля» на чистом сервере:
1. Обновляет пакеты ОС Ubuntu 24.04.
2. Настраивает фаервол UFW (порты 22, 80, 443).
3. Устанавливает официальный Docker CE и плагин Docker Compose.
4. Копирует файлы проекта в `/opt/laptopservice`.
5. Собирает многослойный Docker-образ (Node 22 для сборки статики Astro + Caddy 2 для раздачи).
6. Запускает Caddy с автоматическим получением бесплатных SSL-сертификатов (Let's Encrypt / ZeroSSL) и 301-редиректом с `remontnoutbukov.uz` на `laptopservice.uz`.

---

## Инструкция по запуску

1. Установите Ansible на управляющем компьютере:
   ```bash
   pip install ansible
   ansible-galaxy collection install community.docker
   ```

2. Укажите IP-адрес вашего сервера в `ansible/inventory.ini`:
   ```ini
   [webservers]
   laptopservice_vps ansible_host=YOUR_SERVER_IP ansible_user=root
   ```

3. Запустите деплой:
   ```bash
   ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
   ```