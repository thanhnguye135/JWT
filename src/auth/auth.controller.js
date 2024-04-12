exports.register = async (req, res) => {
	const username = req.body.username.toLowerCase();
	const user = await userModel.getUser(username);
	if (user) res.status(409).send('Tên tài khoản đã tồn tại.');
	else {
		const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
		const newUser = {
			username: username,
			password: hashPassword,
            ... Thêm các tham số khác tại đây ...
		};
		const createUser = await userModel.createUser(newUser);
		if (!createUser) {
			return res
				.status(400)
				.send('Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.');
		}
		return res.send({
			username,
		});
	}
};
exports.register = async (req, res) => {
	const username = req.body.username.toLowerCase();
	const user = await userModel.getUser(username);
	if (user) res.status(409).send('Tên tài khoản đã tồn tại.');
	else {
		const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
		const newUser = {
			username: username,
			password: hashPassword,
            ... Thêm các tham số khác tại đây ...
		};
		const createUser = await userModel.createUser(newUser);
		if (!createUser) {
			return res
				.status(400)
				.send('Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.');
		}
		return res.send({
			username,
		});
	}
};

exports.login = async (req, res) => {
	const username = req.body.username.toLowerCase() || 'test';
	const password = req.body.password || '12345';

	const user = await userModel.getUser(username);
	if (!user) {
		return res.status(401).send('Tên đăng nhập không tồn tại.');
	}

	const isPasswordValid = bcrypt.compareSync(password, user.password);
	if (!isPasswordValid) {
		return res.status(401).send('Mật khẩu không chính xác.');
	}

	const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
	const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

	const dataForAccessToken = {
		username: user.username,
	};
	const accessToken = await authMethod.generateToken(
		dataForAccessToken,
		accessTokenSecret,
		accessTokenLife,
	);
	if (!accessToken) {
		return res
			.status(401)
			.send('Đăng nhập không thành công, vui lòng thử lại.');
	}

	let refreshToken = randToken.generate(jwtVariable.refreshTokenSize); // tạo 1 refresh token ngẫu nhiên
	if (!user.refreshToken) {
		// Nếu user này chưa có refresh token thì lưu refresh token đó vào database
		await userModel.updateRefreshToken(user.username, refreshToken);
	} else {
		// Nếu user này đã có refresh token thì lấy refresh token đó từ database
		refreshToken = user.refreshToken;
	}

	return res.json({
		msg: 'Đăng nhập thành công.',
		accessToken,
		refreshToken,
		user,
	});
};

