const { validationResult } = require('express-validator/check');
const {
	findOneUser,
	findOneUserByIdAndUpdate
} = absoluteRequire('repositories/user');

exports.getContact = async (req, res) => {
	try {
		const {
			_id
		} = req.currentUser;

		const result = await findOneUser(
			{
				_id
			}
		);

		if (result) {
			res.status(200)
				.json({
					success: true,
					result: result.contacts
				});
		} else {
			res.status(500)
				.json({
					success: false,
					errors: []
				});
		}
	} catch (e) {
		res.status(500)
			.json({
				success: false,
				errors: []
			});
	}
};

exports.postAddContact = async (req, res) => {
	const errors = validationResult(req).array();

	const {
		nickname: contactUserNickname
	} = req.body;

	const {
		_id: contactOwnerId
	} = req.currentUser;

	if (errors.length > 0) {
		res
			.status(400)
			.json({
				success: false,
				errors
			});
	} else {
		try {
			const result = await findOneUserByIdAndUpdate(contactOwnerId, {
				$addToSet: {
					contacts: {
						contactUserNickname
					}
				}
			});

			if (result) {
				res.status(200)
					.json({
						success: true,
						errors: []
					});
			} else {
				res.status(500)
					.json({
						success: false,
						errors: []
					});
			}
		} catch (e) {
			res.status(500)
				.json({
					success: false,
					errors: []
				});
		}
	}
};
