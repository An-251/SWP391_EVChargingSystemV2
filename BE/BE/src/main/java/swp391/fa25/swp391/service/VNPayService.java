package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.config.VNPayConfig;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    /**
     * Generate VNPay payment URL
     */
    public String createPaymentUrl(String transactionId, Long amount, String orderInfo, String returnUrl) {
        try {
            Map<String, String> vnpParams = new TreeMap<>();
            
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay requires amount in smallest unit (VND * 100)
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", transactionId);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", returnUrl != null ? returnUrl : vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", "127.0.0.1");

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnpCreateDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_CreateDate", vnpCreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnpExpireDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_ExpireDate", vnpExpireDate);

            // Build query string
            StringBuilder query = new StringBuilder();
            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
                if (query.length() > 0) {
                    query.append('&');
                }
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII.toString()));
            }

            // Generate secure hash
            String signData = query.toString();
            String vnpSecureHash = hmacSHA512(vnPayConfig.getHashSecret(), signData);
            
            String paymentUrl = vnPayConfig.getUrl() + "?" + query + "&vnp_SecureHash=" + vnpSecureHash;
            
            log.info("Generated VNPay payment URL for transaction: {}", transactionId);
            return paymentUrl;
            
        } catch (Exception e) {
            log.error("Error creating VNPay payment URL: {}", e.getMessage());
            throw new RuntimeException("Error creating payment URL: " + e.getMessage());
        }
    }

    /**
     * Validate VNPay callback signature
     */
    public boolean validateCallback(Map<String, String> params) {
        try {
            // Create a copy to avoid modifying the original params
            Map<String, String> paramsCopy = new HashMap<>(params);
            
            String vnpSecureHash = paramsCopy.get("vnp_SecureHash");
            paramsCopy.remove("vnp_SecureHashType");
            paramsCopy.remove("vnp_SecureHash");

            // Sort parameters
            Map<String, String> sortedParams = new TreeMap<>(paramsCopy);

            // Build hash data
            StringBuilder hashData = new StringBuilder();
            for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
                if (hashData.length() > 0) {
                    hashData.append('&');
                }
                hashData.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII.toString()));
                hashData.append('=');
                hashData.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII.toString()));
            }

            String calculatedHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            
            log.info("🔐 Signature validation: calculated={}, received={}, match={}", 
                    calculatedHash.substring(0, 10) + "...", 
                    vnpSecureHash != null ? vnpSecureHash.substring(0, 10) + "..." : "null",
                    calculatedHash.equals(vnpSecureHash));
            
            return calculatedHash.equals(vnpSecureHash);
        } catch (Exception e) {
            log.error("Error validating VNPay callback: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * HMAC SHA512 hash function
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Error generating HMAC SHA512: {}", e.getMessage());
            throw new RuntimeException("Error generating hash");
        }
    }

    /**
     * Parse transaction ID to extract payment type and reference ID
     * Format: INVOICE_{invoiceId}_{timestamp} or SUB_{planId}_{driverId}_{timestamp}
     */
    public Map<String, String> parseTransactionId(String transactionId) {
        Map<String, String> result = new HashMap<>();
        String[] parts = transactionId.split("_");
        
        if (parts.length >= 2) {
            result.put("paymentType", parts[0]); // INVOICE or SUB
            result.put("referenceId", parts[1]); // planId or invoiceId
            
            // For subscription, also extract driverId (format: SUB_{planId}_{driverId}_{timestamp})
            if ("SUB".equals(parts[0]) && parts.length >= 3) {
                result.put("driverId", parts[2]);
            }
        }
        
        return result;
    }
}
