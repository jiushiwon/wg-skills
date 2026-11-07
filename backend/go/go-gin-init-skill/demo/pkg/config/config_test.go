package config

import "testing"

func TestValidateJWTSecret(t *testing.T) {
	cases := []struct {
		name    string
		secret  string
		wantErr bool
	}{
		{"空密钥", "", true},
		{"弱密钥", "wg-skills-secret", true},
		{"刚好 31 字节", "1234567890123456789012345678901", true},
		{"刚好 32 字节", "12345678901234567890123456789012", false},
		{"足够长", "wg-skills-demo-only-secret-change-me-32bytes", false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			err := ValidateJWTSecret(c.secret)
			if (err != nil) != c.wantErr {
				t.Fatalf("ValidateJWTSecret(%q) err = %v, wantErr = %v", c.secret, err, c.wantErr)
			}
		})
	}
}
