# Atlas CRM - Payment Flow Testing Guide

## Redsys Integration Test

### Test Credentials
```
Merchant Code: 999008881
Terminal: 001
Currency: EUR (978)
Secret Key: sq7HjrUOBfKmC576ILgskD5srU870gJ7
```

### Test Cards

**Successful Payment:**
- Card: 4548 8120 4940 0004
- Expiry: Any future date
- CVV: Any 3 digits

**Failed Payment (Insufficient funds):**
- Card: 1111 1111 1111 1117
- Expiry: Any future date
- CVV: Any 3 digits

### Test Flow

1. **Create Quote**
   - Go to /presupuestos
   - Click "Nuevo"
   - Fill client details
   - Add products
   - Save

2. **Send Quote**
   - Open quote detail
   - Click "Enviar"
   - Verify email sent

3. **Client Pays**
   - Click payment link in email
   - Enter test card details
   - Complete payment

4. **Verify Reservation Created**
   - Check /reservas
   - Verify quote status = "pagado"
   - Verify pipeline moved to "Cerrado"

### Webhook Testing

Redsys sends payment notifications to:
```
POST /api/crm/webhooks/redsys
```

Verify webhook handling:
1. Check logs for webhook receipt
2. Verify signature validation
3. Confirm reservation creation

### Refund Testing

1. Open paid reservation
2. Click "Cancelar"
3. Select refund reason
4. Verify bono created
5. Check Redsys for refund transaction

## Automated Tests

Run payment flow tests:
```bash
npm test -- payment
```

## Production Checklist

- [ ] Redsys production credentials configured
- [ ] Merchant URL registered with Redsys
- [ ] SSL certificate valid
- [ ] Webhook endpoint publicly accessible
- [ ] Error handling tested
- [ ] Refund policy configured
- [ ] Email notifications working
- [ ] Receipts generating correctly

## Common Issues

### "Error en datos enviados"
- Check merchant code is correct
- Verify terminal number
- Ensure currency code is 978 (EUR)

### "Firma incorrecta"
- Check secret key is correct
- Verify signature calculation
- Ensure no extra whitespace in keys

### Webhook not received
- Check URL is publicly accessible
- Verify firewall not blocking
- Check logs for 404 errors

### Payment not creating reservation
- Check webhook processing logs
- Verify quote status update
- Check for database errors
