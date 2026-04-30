import React, { useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Image, 
  SafeAreaView, 
  Pressable, 
  StatusBar, 
  useWindowDimensions,
  Platform
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

// --- BRAND CONSTANTS ---
const COLORS = {
  primary: '#FF6B00',
  dark: '#0D1117',
  darkCard: '#161B22',
  lightText: '#E6EDF3',
  mutedText: '#8B949E',
  white: '#FFFFFF',
  grey: '#F9FAFB',
  border: '#30363D',
  lightBorder: '#E5E7EB',
};

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
};

// --- SUB-COMPONENTS ---

const SectionTitle = ({ title, subtitle, centered = true, light = false }: any) => (
  <View style={[styles.sectionHeader, !centered && { alignItems: 'flex-start' }]}>
    <Text style={[styles.sectionTitle, light && { color: COLORS.white }]}>{title}</Text>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </View>
);

const CustomButton = ({ title, type = 'primary', onPress, style }: any) => (
  <Pressable 
    onPress={onPress}
    style={({ pressed }) => [
      styles.btn,
      type === 'primary' ? styles.btnPrimary : styles.btnOutline,
      pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      style
    ]}
  >
    <Text style={[
      styles.btnText, 
      type === 'primary' ? styles.btnTextPrimary : styles.btnTextOutline
    ]}>
      {title}
    </Text>
  </Pressable>
);

const StepCard = ({ number, title, desc, isWide }: any) => (
  <View style={[styles.stepCard, isWide && { flex: 1 }]}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <Text style={styles.stepTitle}>{title}</Text>
    <Text style={styles.stepDesc}>{desc}</Text>
  </View>
);

const FeatureCard = ({ icon, title, desc }: any) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDesc}>{desc}</Text>
  </View>
);

const BikeCard = ({ name, tag, desc, price, image, onPress }: any) => (
  <View style={styles.bikeCard}>
    <Image source={{ uri: image }} style={styles.bikeCardImage} />
    <View style={styles.bikeCardContent}>
      <View style={styles.bikeCardBadge}>
        <Text style={styles.bikeCardBadgeText}>{tag}</Text>
      </View>
      <Text style={styles.bikeCardTitle}>{name}</Text>
      <Text style={styles.bikeCardDesc}>{desc}</Text>
      <View style={styles.bikeCardPriceRow}>
        <Text style={styles.bikeCardPrice}>{price} FCFA</Text>
        <Text style={styles.bikeCardPriceUnit}> / min</Text>
      </View>
      <CustomButton title="Book Now" style={{ marginTop: 12 }} onPress={onPress} />
    </View>
  </View>
);

const TestimonialCard = ({ quote, name, city }: any) => (
  <View style={styles.testimonialCard}>
    <Text style={styles.stars}>★★★★★</Text>
    <Text style={styles.quote}>"{quote}"</Text>
    <View>
      <Text style={styles.testimonialName}>{name}</Text>
      <Text style={styles.testimonialCity}>{city}</Text>
    </View>
  </View>
);

// --- MAIN SCREEN ---

const LandingPage = () => {
  const { session } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const isWide = width >= BREAKPOINTS.tablet;

  const scrollToHowItWorks = () => {
    scrollViewRef.current?.scrollTo({ y: isWide ? 800 : 1200, animated: true });
  };

  const navToSignup = () => router.push('/(auth)/signup');
  const navToSignin = () => router.push('/(auth)/login');
  const navToDashboard = () => router.push('/(tabs)/dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* SECTION 1 — NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Text style={styles.logoText}>Smart Okada</Text>
          <View style={styles.logoDot} />
        </View>
        
        {isWide && (
          <View style={styles.navCenter}>
            <Pressable onPress={scrollToHowItWorks}><Text style={styles.navLink}>How it works</Text></Pressable>
            <Pressable><Text style={styles.navLink}>Models</Text></Pressable>
            <Pressable><Text style={styles.navLink}>Pricing</Text></Pressable>
          </View>
        )}
        
        <View style={styles.navRight}>
          {isWide && (
            <Pressable style={styles.navGhostBtn} onPress={navToSignin}>
              <Text style={styles.navGhostBtnText}>Sign In</Text>
            </Pressable>
          )}
          <Pressable style={styles.navFilledBtn} onPress={navToSignup}>
            <Text style={styles.navFilledBtnText}>Get Started</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        
        {/* SECTION 2 — HERO */}
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View style={[styles.heroTextContainer, isWide && { flex: 1, paddingRight: 40 }]}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>SMART OKADA NETWORK</Text>
            </View>
            <Text style={styles.heroH1}>
              Move Faster.{'\n'}
              <Text style={{ color: COLORS.primary }}>Ride Smarter.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Premium motorcycle rentals across Cameroon. Find, book, and ride in under 60 seconds.
            </Text>
            
            <View style={[styles.heroActions, isWide && { flexDirection: 'row', gap: 16 }]}>
              <CustomButton 
                title={session ? "Go to Dashboard →" : "Create Free Account →"} 
                onPress={session ? navToDashboard : navToSignup}
                style={[styles.heroBtn, { marginTop: 24 }]} 
              />
              <CustomButton 
                title="See How It Works" 
                type="outline" 
                onPress={scrollToHowItWorks}
                style={[styles.heroBtn, isWide ? { marginTop: 24 } : { marginTop: 12 }]} 
              />
            </View>
          </View>
          
          <View style={[styles.heroImageContainer, isWide && { flex: 1 }]}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1558981285-6f0c68730899?w=800' }} 
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* SECTION 3 — HOW IT WORKS */}
        <View style={styles.howItWorks}>
          <SectionTitle 
            title="How it works" 
            subtitle="Up and riding in 3 simple steps" 
          />
          
          <View style={[styles.stepsContainer, isWide && styles.stepsContainerWide]}>
            <StepCard 
              number="1" 
              title="Create your account" 
              desc="Sign up free in under 2 minutes. No deposits, no paperwork."
              isWide={isWide}
            />
            <StepCard 
              number="2" 
              title="Find a bike near you" 
              desc="Browse available motorcycles at stations near your location."
              isWide={isWide}
            />
            <StepCard 
              number="3" 
              title="Ride & pay per minute" 
              desc="Unlock your bike, ride, return it. Only pay for the time you use."
              isWide={isWide}
            />
          </View>
        </View>

        {/* SECTION 4 — WHY CHOOSE US */}
        <View style={styles.whyChoose}>
          <SectionTitle title="Why choose Smart Okada?" />
          
          <View style={styles.featuresGrid}>
            <FeatureCard 
              icon="⚡" 
              title="Instant Booking" 
              desc="Unlock a motorcycle in seconds using your phone. No queues, no waiting." 
            />
            <FeatureCard 
              icon="🛡" 
              title="Certified & Safe" 
              desc="Every bike maintained to strict safety standards by certified mechanics." 
            />
            <FeatureCard 
              icon="⭐" 
              title="Premium Fleet" 
              desc="Yamaha YBR 125, Boxer BMX 150, and TVS HLX series available." 
            />
            <FeatureCard 
              icon="💳" 
              title="Pay As You Go" 
              desc="No subscriptions. Only pay for the exact minutes you ride. From 130 FCFA/min." 
            />
          </View>
        </View>

        {/* SECTION 5 — FEATURED MODELS */}
        <View style={styles.featuredModels}>
          <SectionTitle 
            title="Featured Models" 
            subtitle="The standards of reliability and power" 
          />
          
          <ScrollView 
            horizontal={!isWide}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.bikeList, isWide && styles.bikeListWide]}
          >
            <BikeCard 
              name="Yamaha YBR 125"
              tag="CITY FAVORITE"
              desc="Renowned for reliability and fuel efficiency."
              price="150"
              image="https://images.unsplash.com/photo-1558981285-6f0c68730899?w=400"
              onPress={navToSignup}
            />
            <BikeCard 
              name="Boxer BMX 150"
              tag="HEAVY DUTY"
              desc="Rugged frame for high load and long distances."
              price="180"
              image="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400"
              onPress={navToSignup}
            />
            <BikeCard 
              name="TVS HLX 125"
              tag="BEST VALUE"
              desc="Lightweight and economical for daily commuting."
              price="130"
              image="https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400"
              onPress={navToSignup}
            />
          </ScrollView>
          
          <Pressable style={styles.viewAllLink} onPress={navToSignup}>
            <Text style={styles.viewAllLinkText}>View all models</Text>
          </Pressable>
        </View>

        {/* SECTION 6 — TESTIMONIALS */}
        <View style={styles.testimonials}>
          <SectionTitle title="What riders are saying" light={true} />
          
          <ScrollView 
            horizontal={!isWide}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.testimonialList, isWide && styles.testimonialListWide]}
          >
            <TestimonialCard 
              quote="Finally a service that works! I booked my first bike in less than a minute. Absolute game changer for commuting in Yaoundé."
              name="Jean-Paul M."
              city="Yaoundé"
            />
            <TestimonialCard 
              quote="The Yamaha YBR is smooth and pricing is very fair. I use Smart Okada every day to get to work."
              name="Aïcha N."
              city="Douala"
            />
            <TestimonialCard 
              quote="Clean bikes, easy app, fast support. This is the future of transport in Cameroon. Highly recommend."
              name="Boris T."
              city="Yaoundé"
            />
          </ScrollView>
        </View>

        {/* SECTION 7 — FINAL CTA */}
        <View style={styles.finalCta}>
          <Text style={styles.ctaHeading}>Ready to start your first journey?</Text>
          <Text style={styles.ctaSubheadline}>Join riders across Cameroon. Create your free account today.</Text>
          
          <Pressable 
            style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.9 }]}
            onPress={navToSignup}
          >
            <Text style={styles.ctaButtonText}>Create Account — It's Free →</Text>
          </Pressable>
          
          <View style={styles.ctaFooter}>
            <Text style={styles.ctaFooterText}>Already have an account? </Text>
            <Pressable onPress={navToSignin}>
              <Text style={styles.ctaLoginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>

        {/* SECTION 8 — FOOTER */}
        <View style={styles.footer}>
          <View style={[styles.footerTop, isWide && styles.footerTopWide]}>
            <Text style={styles.footerLogo}>Smart Okada Network</Text>
            <Text style={styles.footerCopyright}>© 2026 Smart Okada Network. Cameroon Urban Mobility.</Text>
          </View>
          
          <View style={styles.footerDivider} />
          
          <View style={styles.footerLinks}>
            <View style={styles.footerLinkCol}>
              <Text style={styles.footerLinkHeader}>Company</Text>
              <Pressable onPress={navToSignup}><Text style={styles.footerLink}>About Us</Text></Pressable>
              <Pressable onPress={navToSignup}><Text style={styles.footerLink}>How It Works</Text></Pressable>
              <Pressable onPress={navToSignup}><Text style={styles.footerLink}>Our Fleet</Text></Pressable>
            </View>
            <View style={styles.footerLinkCol}>
              <Text style={styles.footerLinkHeader}>Support</Text>
              <Pressable onPress={navToSignup}><Text style={styles.footerLink}>Contact Us</Text></Pressable>
              <Pressable onPress={navToSignup}><Text style={styles.footerLink}>FAQ</Text></Pressable>
              <Pressable onPress={navToSignup}><Text style={styles.footerLink}>Safety</Text></Pressable>
            </View>
            <View style={styles.footerLinkCol}>
              <Text style={styles.footerLinkHeader}>Legal</Text>
              <Pressable onPress={navToSignup}><Text style={styles.footerLink}>Privacy Policy</Text></Pressable>
              <Pressable onPress={navToSignup}><Text style={styles.footerLink}>Terms of Use</Text></Pressable>
            </View>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // NAVBAR
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.dark,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginLeft: 4,
    marginTop: 4,
  },
  navCenter: {
    flexDirection: 'row',
    gap: 24,
  },
  navLink: {
    color: COLORS.mutedText,
    fontSize: 14,
    fontWeight: '500',
  },
  navRight: {
    flexDirection: 'row',
    gap: 12,
  },
  navGhostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  navGhostBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  navFilledBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  navFilledBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  // HERO
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: COLORS.dark,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 100,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroH1: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.lightText,
    lineHeight: 56,
  },
  heroSubtitle: {
    fontSize: 18,
    color: COLORS.mutedText,
    marginTop: 16,
    lineHeight: 28,
  },
  heroActions: {
    marginTop: 12,
  },
  heroBtn: {
    width: '100%',
    maxWidth: 300,
  },
  heroImageContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 260,
  },

  // COMMON SECTION HEADERS
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.mutedText,
    marginTop: 8,
    textAlign: 'center',
  },

  // HOW IT WORKS
  howItWorks: {
    backgroundColor: COLORS.white,
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  stepsContainer: {
    gap: 24,
  },
  stepsContainerWide: {
    flexDirection: 'row',
  },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    alignItems: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  stepDesc: {
    fontSize: 15,
    color: COLORS.mutedText,
    lineHeight: 22,
  },

  // WHY CHOOSE US
  whyChoose: {
    backgroundColor: COLORS.grey,
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    marginBottom: 8,
    minHeight: 200,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: COLORS.mutedText,
    lineHeight: 20,
  },

  // FEATURED MODELS
  featuredModels: {
    backgroundColor: COLORS.white,
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  bikeList: {
    paddingRight: 24,
  },
  bikeListWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 24,
  },
  bikeCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    overflow: 'hidden',
    marginRight: 16,
  },
  bikeCardImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.grey,
  },
  bikeCardContent: {
    padding: 20,
  },
  bikeCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  bikeCardBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bikeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  bikeCardDesc: {
    fontSize: 14,
    color: COLORS.mutedText,
    marginBottom: 16,
  },
  bikeCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bikeCardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bikeCardPriceUnit: {
    fontSize: 12,
    color: COLORS.mutedText,
  },
  viewAllLink: {
    marginTop: 40,
    alignItems: 'center',
  },
  viewAllLinkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },

  // TESTIMONIALS
  testimonials: {
    backgroundColor: COLORS.dark,
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  testimonialList: {
    paddingRight: 24,
  },
  testimonialListWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  testimonialCard: {
    width: 300,
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 16,
  },
  stars: {
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 16,
  },
  quote: {
    color: COLORS.lightText,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 20,
  },
  testimonialName: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  testimonialCity: {
    color: COLORS.mutedText,
    fontSize: 12,
    marginTop: 2,
  },

  // FINAL CTA
  finalCta: {
    backgroundColor: COLORS.dark,
    paddingVertical: 120,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaHeading: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 44,
  },
  ctaSubheadline: {
    fontSize: 18,
    color: COLORS.mutedText,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 600,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 48,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaFooter: {
    flexDirection: 'row',
    marginTop: 24,
  },
  ctaFooterText: {
    color: COLORS.mutedText,
    fontSize: 15,
  },
  ctaLoginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },

  // FOOTER
  footer: {
    backgroundColor: COLORS.darkCard,
    padding: 48,
  },
  footerTop: {
    gap: 12,
  },
  footerTopWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  footerCopyright: {
    color: COLORS.mutedText,
    fontSize: 12,
  },
  footerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 40,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 48,
  },
  footerLinkCol: {
    gap: 12,
  },
  footerLinkHeader: {
    color: COLORS.lightText,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerLink: {
    color: COLORS.mutedText,
    fontSize: 14,
  },

  // BUTTON HELPERS
  btn: {
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnTextPrimary: {
    color: COLORS.white,
  },
  btnTextOutline: {
    color: COLORS.primary,
  },
});

export default React.memo(LandingPage);
