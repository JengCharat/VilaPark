package com.vilapark.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// ⭐ เพิ่ม import สำหรับ CORS
import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import com.vilapark.security.jwt.AuthEntryPointJwt;
import com.vilapark.security.jwt.AuthTokenFilter;
import com.vilapark.security.services.UserDetailsServiceImpl;

import org.springframework.http.HttpMethod;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

  @Autowired
  UserDetailsServiceImpl userDetailsService;

  @Autowired
  private AuthEntryPointJwt unauthorizedHandler;

  @Bean
  public AuthTokenFilter authenticationJwtTokenFilter() {
    return new AuthTokenFilter();
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
  }

  @Bean
  public AuthenticationManager authenticationManager(org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /*
   * @Override
   * protected void configure(HttpSecurity http) throws Exception {
   * http.cors().and().csrf().disable()
   * .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
   * .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).
   * and()
   * .authorizeRequests().antMatchers("/api/auth/**").permitAll()
   * .antMatchers("/api/test/**").permitAll()
   * .anyRequest().authenticated();
   * 
   * http.addFilterBefore(authenticationJwtTokenFilter(),
   * UsernamePasswordAuthenticationFilter.class);
   * }
   */

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        // ⭐ เปิด CORS (จะไปเรียก bean corsConfigurationSource() ด้านล่าง)
        .cors(Customizer.withDefaults())
        .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth.requestMatchers("/api/auth/**").permitAll()

            .requestMatchers("/api/test/**").permitAll()
            // .requestMatchers(HttpMethod.GET, "/users/**").permitAll()
            .requestMatchers("/users/**").permitAll()
            .requestMatchers("/cats/**").permitAll()
            .requestMatchers("/api/daily-updates", "/api/daily-updates/**").permitAll()
            .requestMatchers("/bookings/**").permitAll()
            .requestMatchers("/rooms/**").permitAll()
            .requestMatchers("/bookings/**", "/api/bookings/**").permitAll()   // ⭐ เผื่อเรียกแบบมี /api
            .requestMatchers("/income/**", "/api/income/**").permitAll()       // ⭐ เส้นทางรายได้
            .requestMatchers("/api/daily-updates","/api/daily-updates/**").permitAll()
            .requestMatchers("/api/stocks/**").permitAll()

            .requestMatchers("/api/daily-updates/upload").permitAll()
            .requestMatchers("/uploads/**").permitAll()

            .anyRequest().authenticated());

    http.authenticationProvider(authenticationProvider());
    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  // ⭐ กำหนด CORS ชัดเจน (dev)
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();

    cfg.addAllowedOriginPattern("*");

    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    cfg.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
}
}

