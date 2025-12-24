# Food Marketplace Backend API

Backend API pour l'application marketplace alimentaire construite avec LoopBack 4.

## 🚀 Installation et Configuration

### 1. Installation des dépendances
```bash
cd backend
npm install
```

### 2. Configuration de la base de données
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables d'environnement dans .env
# Configurer votre base de données PostgreSQL
```

### 3. Démarrage du serveur
```bash
# Mode développement
npm run start

# Mode développement avec rechargement automatique
npm run build:watch
```

Le serveur démarre sur `http://localhost:3000`
L'explorateur API est disponible sur `http://localhost:3000/explorer`

## 📊 Structure de l'API

### 🏪 Vendeurs (Vendors)
- `POST /vendors/register` - Inscription vendeur
- `POST /vendors/login` - Connexion vendeur
- `GET /vendors/me` - Profil vendeur actuel
- `PATCH /vendors/{id}` - Modifier profil
- `PATCH /vendors/{id}/availability` - Toggle disponibilité

### 🍽️ Produits (Products)
- `POST /products` - Créer un produit
- `GET /products/feed` - Fil d'actualité produits
- `GET /products/my-products` - Mes produits
- `PATCH /products/{id}` - Modifier produit
- `PATCH /products/{id}/availability` - Toggle disponibilité
- `DELETE /products/{id}` - Supprimer produit

### 📦 Commandes (Orders)
- `POST /orders` - Créer une commande
- `GET /orders/my-orders` - Mes commandes (vendeur)
- `GET /orders/analytics` - Statistiques commandes
- `PATCH /orders/{id}/status` - Changer statut commande

## 🔐 Authentification

L'API utilise JWT pour l'authentification. Incluez le token dans l'en-tête :
```
Authorization: Bearer <your-jwt-token>
```

## 📱 Intégration Frontend

### Configuration Angular/Ionic
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

### Service HTTP
```typescript
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      })
    };
  }

  // Authentification
  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/vendors/login`, credentials);
  }

  register(vendor: any) {
    return this.http.post(`${this.apiUrl}/vendors/register`, vendor);
  }

  // Produits
  getProductsFeed() {
    return this.http.get(`${this.apiUrl}/products/feed`);
  }

  getMyProducts() {
    return this.http.get(`${this.apiUrl}/products/my-products`, this.getHeaders());
  }

  createProduct(product: any) {
    return this.http.post(`${this.apiUrl}/products`, product, this.getHeaders());
  }

  // Commandes
  getMyOrders() {
    return this.http.get(`${this.apiUrl}/orders/my-orders`, this.getHeaders());
  }

  getAnalytics() {
    return this.http.get(`${this.apiUrl}/orders/analytics`, this.getHeaders());
  }
}
```

## 🗄️ Base de données

### Schéma PostgreSQL
```sql
-- Créer la base de données
CREATE DATABASE food_marketplace;

-- Les tables seront créées automatiquement par LoopBack
```

### Modèles de données
- **Vendor** : Informations vendeur
- **Product** : Produits avec catégories (sucré, salé, mixte, jus)
- **Order** : Commandes avec workflow de statuts

## 🔧 Scripts disponibles

```bash
npm run build          # Compiler TypeScript
npm run start          # Démarrer le serveur
npm run build:watch    # Mode développement avec rechargement
npm run lint           # Vérifier le code
npm run test           # Lancer les tests
```

## 🌐 CORS

Le serveur est configuré pour accepter les requêtes depuis :
- `http://localhost:4200` (Angular)
- `http://localhost:8100` (Ionic)

## 📈 Fonctionnalités

✅ Authentification JWT
✅ CRUD complet pour vendeurs, produits et commandes
✅ Système de disponibilité vendeur/produit
✅ Analytics et statistiques
✅ Validation des données
✅ Relations entre modèles
✅ Documentation API automatique
✅ Support CORS pour frontend