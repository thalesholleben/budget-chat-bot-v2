#!/bin/bash

# Script de Deploy Automático - Octopus AI Assistant
# Para usar: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🐙 Octopus AI Assistant - Deploy Script"
echo "========================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para print colorido
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

print_success "Docker encontrado"

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

print_success "Docker Compose encontrado"

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    print_warning "Arquivo .env não encontrado. Criando a partir do .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Arquivo .env criado. Por favor, configure as variáveis antes de continuar."
        echo ""
        echo "Edite o arquivo .env com suas configurações:"
        echo "  nano .env"
        echo ""
        echo "Variáveis necessárias:"
        echo "  - VITE_WEBHOOK_URL"
        echo "  - VITE_WEBHOOK_API_KEY"
        echo ""
        exit 1
    else
        print_error "Arquivo .env.example não encontrado!"
        exit 1
    fi
fi

print_success "Arquivo .env encontrado"

# Carregar variáveis do .env
source .env

# Validar variáveis de ambiente
if [ -z "$VITE_WEBHOOK_URL" ]; then
    print_error "VITE_WEBHOOK_URL não está definida no arquivo .env"
    exit 1
fi

if [ -z "$VITE_WEBHOOK_API_KEY" ]; then
    print_error "VITE_WEBHOOK_API_KEY não está definida no arquivo .env"
    exit 1
fi

print_success "Variáveis de ambiente validadas"

# Parar containers antigos se existirem
echo ""
echo "📦 Parando containers antigos..."
docker-compose down 2>/dev/null || true
print_success "Containers antigos parados"

# Build da nova imagem
echo ""
echo "🔨 Fazendo build da nova imagem..."
docker-compose build --no-cache
print_success "Build completo"

# Iniciar containers
echo ""
echo "🚀 Iniciando containers..."
docker-compose up -d
print_success "Containers iniciados"

# Aguardar alguns segundos
echo ""
echo "⏳ Aguardando containers iniciarem..."
sleep 5

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker-compose ps

# Verificar logs
echo ""
echo "📝 Últimas linhas do log:"
docker-compose logs --tail=20

# Testar se está respondendo
echo ""
echo "🧪 Testando aplicação..."
if curl -s http://localhost:8080 > /dev/null; then
    print_success "Aplicação está respondendo em http://localhost:8080"
else
    print_warning "Aplicação pode não estar respondendo ainda. Verifique os logs."
fi

echo ""
echo "========================================"
print_success "Deploy concluído!"
echo ""
echo "Comandos úteis:"
echo "  Ver logs: docker-compose logs -f"
echo "  Parar: docker-compose down"
echo "  Restart: docker-compose restart"
echo ""
echo "Acesse: http://localhost:8080"
echo "========================================"
