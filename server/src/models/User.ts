import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types';

/**
 * USER MODEL - Payment-Grade Security
 ** "I implemented the User model with security-first principles:
 * - Passwords are NEVER stored in plaintext (bcrypt with 12 rounds)
 * - Sensitive fields use 'select: false' to prevent accidental exposure
 * - Email is unique and indexed for fast lookups
 * - The model supports both local and OAuth authentication"
 */

/**
 * IUser Interface - Document Type
 * Extends Mongoose Document with our custom fields
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password?: string; // Optional because OAuth users don't have passwords
  role: UserRole;
  provider: 'local' | 'google';
  googleId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Instance Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Schema Definition
 */
const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Fast lookups during login
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: function (this: IUser) {
        // Password required only for local auth
        return this.provider === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // SECURITY: Never return password in queries by default
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      required: true,
    },

    googleId: {
      type: String,
      sparse: true, // Allows multiple null values (only OAuth users have this)
      select: false, // SECURITY: Don't expose OAuth IDs
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      transform: function (_doc, ret) {
        // SECURITY: Remove sensitive fields when converting to JSON
        delete ret.password;
        delete ret.googleId;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

/**
 * PRE-SAVE HOOK: Password Hashing
 ** "I use bcrypt with 12 salt rounds, which is the Payment-Grade standard.
 * Each round doubles the computation time, making brute-force attacks exponentially harder.
 * The hook only runs when the password is modified to avoid unnecessary hashing."
 */
UserSchema.pre('save', async function (next) {
  // Only hash if password is modified or new
  if (!this.isModified('password')) {
    return next();
  }

  // Skip hashing if no password (OAuth users)
  if (!this.password) {
    return next();
  }

  try {
    // Generate salt with 12 rounds (Payment-Grade: 2^12 iterations)
    const salt = await bcrypt.genSalt(12);

    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * INSTANCE METHOD: Compare Password
 ** "This method safely compares a plaintext password with the stored hash.
 * Bcrypt's compare function is timing-attack resistant - it takes the same time
 * regardless of whether the password is correct, preventing attackers from
 * inferring information from response times."
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    if (!this.password) {
      return false; // OAuth users don't have passwords
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * INDEXES
 ** "I created a compound index on email and provider to optimize login queries.
 * This is critical for performance at scale - without it, MongoDB would scan
 * every document. With it, lookups are O(log n) instead of O(n)."
 */
UserSchema.index({ email: 1, provider: 1 });

/**
 * Export User Model
 */
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
